/**
 * Local development demo identities and data. Run only against local Supabase.
 * Credentials are read server-side. The admin account uses ADMIN_PHONE from .env.local.
 * Do not use demo phone numbers in production or turn on SMS delivery for these users.
 */
import { existsSync } from 'node:fs';
import { createClient, type User } from '@supabase/supabase-js';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPhone = process.env.ADMIN_PHONE;
if (!url || !serviceKey || !adminPhone || !/^\+91[6-9]\d{9}$/.test(adminPhone)) {
  throw new Error('Provide NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, valid ADMIN_PHONE in .env.local.');
}
const host = new URL(url).hostname;
if (!['127.0.0.1','localhost'].includes(host)) {
  throw new Error('Refusing to create placeholder demo identities outside local Supabase.');
}
const supabase = createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
function checked<T>(result:{data:T | null,error: {message:string} | null},label:string): NonNullable<T> {
  if(result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data as NonNullable<T>;
}
async function ensureUser(phone:string,name:string):Promise<User> {
  for(let page=1;page<=10;page++) {
    const {data,error}=await supabase.auth.admin.listUsers({page,perPage:100});
    if(error)throw error;
    const found=data.users.find(user=>user.phone===phone);
    if(found)return found;
    if(data.users.length<100) break;
  }
  const result=await supabase.auth.admin.createUser({phone,phone_confirm:true,user_metadata:{display_name:name}});
  if(result.error || !result.data.user) throw result.error ?? new Error('Cannot create account');
  return result.data.user;
}
const cities = checked(await supabase.from('cities').select('id,slug'), 'load cities');
const categories = checked(await supabase.from('categories').select('id,slug'), 'load categories');
const cityMap = new Map(cities.map(row=>[row.slug,row.id]));
const catMap = new Map(categories.map(row=>[row.slug,row.id]));
if(cityMap.size!==5 || catMap.size!==11) throw new Error('Run the SQL migration and seed.sql first.');

const admin = await ensureUser(adminPhone,'Nestfix Admin');
checked(await supabase.from('profiles').update({role:'admin',name:'Nestfix Admin',is_blocked:false}).eq('id',admin.id),'promote admin');

const homeCoords:Record<string,[number,number]>={
  noida:[28.5355,77.3910],delhi:[28.6139,77.2090],gurugram:[28.4595,77.0266],
  bengaluru:[12.9716,77.5946],mumbai:[19.0760,72.8777],
};
const demoNames=['Aarav','Meera','Arjun','Kavya','Rohan','Ayesha','Vikram','Pooja','Dev','Nisha',
  'Kabir','Ananya','Kunal','Neha','Rahul','Ishita','Samar','Diya','Manav','Sana'];
const skills=['home-cleaning','ac-service-repair','womens-salon','mens-grooming','massage-spa',
  'electrician','plumber','carpenter','pest-control','painting','appliance-repair'];
const citySlugs=['noida','delhi','gurugram','bengaluru','mumbai'];
const customer=await ensureUser('+919999100001','Demo Customer');
checked(await supabase.from('profiles').update({name:'Demo Customer',city_id:cityMap.get('noida')}).eq('id',customer.id),'customer profile');
const service = checked(await supabase.from('services').select('id,name,price,mrp,duration_minutes').eq('slug','ac-basic-service').single(),'sample service');

for(let i=0;i<20;i++) {
  const phone=`+9199990${String(i+1).padStart(5,'0')}`;
  const name=`${demoNames[i]} ${['Sharma','Khan','Singh','Gupta'][i%4]}`;
  const user=await ensureUser(phone,name);
  const citySlug=citySlugs[i%citySlugs.length];
  const [lat,lng]=homeCoords[citySlug];
  checked(await supabase.from('profiles').update({name,role:'pro',city_id:cityMap.get(citySlug)}).eq('id',user.id),`profile ${i}`);
  checked(await supabase.from('pros').upsert({id:user.id,status:'active',city_id:cityMap.get(citySlug),
    skills:[catMap.get(skills[i%skills.length]),catMap.get(skills[(i+1)%skills.length])],
    kyc_status:'approved',home_lat:lat,home_lng:lng,service_radius_km:20,rating_avg:4.7,jobs_completed:12+i,
  },{onConflict:'id'}),`pro ${i}`);
  for(let weekday=0;weekday<7;weekday++) {
    if(weekday===0) continue;
    checked(await supabase.from('pro_availability').upsert({pro_id:user.id,weekday,start_time:'08:00:00',end_time:'19:00:00'},
      {onConflict:'pro_id,weekday,start_time,end_time'}),`availability ${i}:${weekday}`);
  }
  // A realistic completed historical booking per pro creates sample review rows.
  const code=`NF${String(880001+i)}`;
  const day=new Date(Date.now()-(i+1)*86400000).toISOString().slice(0,10);
  const booking=checked(await supabase.from('bookings').upsert({
    code,user_id:customer.id,pro_id:user.id,city_id:cityMap.get(citySlug),
    address_snapshot:{label:'Home',house:'12A',area:'Demo Colony',pincode:'201301',city:citySlug,lat,lng},
    scheduled_date:day,slot_start:'10:00:00',slot_end:'11:00:00',status:'completed',
    subtotal:service.price,mrp_total:service.mrp,discount:0,visit_fee:49,tax:9,total:service.price+58,
    payment_method:'cash',payment_status:'captured',start_pin:'2468',
  },{onConflict:'code'}).select('id').single(),`booking ${i}`);
  const itemExisting=checked(await supabase.from('booking_items').select('id').eq('booking_id',booking.id).limit(1),'item lookup');
  if(itemExisting.length===0)checked(await supabase.from('booking_items').insert({booking_id:booking.id,service_id:service.id,
    name:service.name,unit_price:service.price,qty:1,duration_minutes:service.duration_minutes}),`item ${i}`);
  checked(await supabase.from('reviews').upsert({booking_id:booking.id,user_id:customer.id,pro_id:user.id,
    rating: i%5===0?4:5,tags:['On time','Professional'],comment:['Very tidy work and friendly service.','Arrived promptly and explained the service.','Careful, courteous and thorough.'][i%3],is_published:true,
  },{onConflict:'booking_id'}),`review ${i}`);
}
console.log('Local demo seeded: 1 admin (ADMIN_PHONE), 20 active pros with availability, 1 customer and 20 published reviews.');
