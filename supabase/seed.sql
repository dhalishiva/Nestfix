-- Idempotent catalog/geo/config seed. Identity-dependent sample pros and reviews: pnpm seed:accounts.
begin;
insert into public.cities(name,slug) values('Noida','noida') on conflict(slug) do update set name=excluded.name;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201301' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201303' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201304' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201305' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201307' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201309' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'201310' from public.cities where slug='noida' on conflict(city_id,pincode) do nothing;
insert into public.cities(name,slug) values('Delhi','delhi') on conflict(slug) do update set name=excluded.name;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110001' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110005' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110016' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110019' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110024' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110034' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110075' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'110092' from public.cities where slug='delhi' on conflict(city_id,pincode) do nothing;
insert into public.cities(name,slug) values('Gurugram','gurugram') on conflict(slug) do update set name=excluded.name;
insert into public.serviceable_pincodes(city_id,pincode) select id,'122001' from public.cities where slug='gurugram' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'122002' from public.cities where slug='gurugram' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'122003' from public.cities where slug='gurugram' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'122009' from public.cities where slug='gurugram' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'122011' from public.cities where slug='gurugram' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'122018' from public.cities where slug='gurugram' on conflict(city_id,pincode) do nothing;
insert into public.cities(name,slug) values('Bengaluru','bengaluru') on conflict(slug) do update set name=excluded.name;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560001' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560034' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560037' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560043' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560066' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560076' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'560100' from public.cities where slug='bengaluru' on conflict(city_id,pincode) do nothing;
insert into public.cities(name,slug) values('Mumbai','mumbai') on conflict(slug) do update set name=excluded.name;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400001' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400050' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400053' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400058' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400070' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400076' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.serviceable_pincodes(city_id,pincode) select id,'400093' from public.cities where slug='mumbai' on conflict(city_id,pincode) do nothing;
insert into public.categories(slug,name,icon,colour,sort_order) values('home-cleaning','Home Cleaning','sparkles','#DFEFE3',1) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Kitchen cleaning',1 from public.categories where slug='home-cleaning' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'kitchen-deep-cleaning','Kitchen deep cleaning','Kitchen deep cleaning by a verified Nestfix professional.',1499,1910,180,array['Degreasing, sink, counters'],array['Cabinet interiors'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='home-cleaning' and s.name='Kitchen cleaning'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'chimney-cleaning','Chimney cleaning','Chimney cleaning by a verified Nestfix professional.',649,850,60,array['Mesh and exterior'],array['Motor repairs'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='home-cleaning' and s.name='Kitchen cleaning'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'fridge-cleaning','Fridge cleaning','Fridge cleaning by a verified Nestfix professional.',499,670,45,array['Interior trays and seals'],array['Repairs'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='home-cleaning' and s.name='Kitchen cleaning'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'microwave-cleaning','Microwave cleaning','Microwave cleaning by a verified Nestfix professional.',349,480,30,array['Internal and outer clean'],array['Spare parts'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='home-cleaning' and s.name='Kitchen cleaning'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.subcategories(category_id,name,sort_order) select id,'Bathroom cleaning',1 from public.categories where slug='home-cleaning' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'bathroom-deep-cleaning','Bathroom deep cleaning','Bathroom deep cleaning by a verified Nestfix professional.',649,850,60,array['Tiles, floor, fixtures'],array['Grout replacement'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='home-cleaning' and s.name='Bathroom cleaning'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'bathroom-combo-2','Bathroom combo (2)','Bathroom combo (2) by a verified Nestfix professional.',1199,1540,120,array['Two bathrooms'],array['Plumbing repairs'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='home-cleaning' and s.name='Bathroom cleaning'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('ac-service-repair','AC Service & Repair','wind','#DEEEF7',2) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'AC care',1 from public.categories where slug='ac-service-repair' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'ac-basic-service','AC basic service','AC basic service by a verified Nestfix professional.',599,790,60,array['Filter and coil wash'],array['Gas refill'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='ac-service-repair' and s.name='AC care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'ac-deep-clean','AC deep clean','AC deep clean by a verified Nestfix professional.',1099,1410,90,array['Jet cleaning, drain flush'],array['Parts'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='ac-service-repair' and s.name='AC care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'ac-gas-refill','AC gas refill','AC gas refill by a verified Nestfix professional.',2499,3150,120,array['Pressure check and refill'],array['Major part repairs'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='ac-service-repair' and s.name='AC care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'ac-inspection','AC inspection','AC inspection by a verified Nestfix professional.',299,420,30,array['Diagnosis and estimate'],array['Parts and gas'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='ac-service-repair' and s.name='AC care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('womens-salon','Women''s Salon','flower-2','#FBE6E4',3) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Skin and hair',1 from public.categories where slug='womens-salon' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'classic-facial','Classic facial','Classic facial by a verified Nestfix professional.',1099,1410,75,array['Cleanse, massage, mask'],array['Premium serum'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='womens-salon' and s.name='Skin and hair'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'hair-spa','Hair spa','Hair spa by a verified Nestfix professional.',1199,1540,75,array['Hair wash, spa massage'],array['Haircut'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='womens-salon' and s.name='Skin and hair'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'waxing-full-arms','Waxing full arms','Waxing full arms by a verified Nestfix professional.',449,610,45,array['Full arms wax'],array['Underarms'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='womens-salon' and s.name='Skin and hair'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'pedicure','Pedicure','Pedicure by a verified Nestfix professional.',799,1040,60,array['Soak, scrub, polish'],array['Gel polish'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='womens-salon' and s.name='Skin and hair'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('mens-grooming','Men''s Grooming','scissors','#E4E7FB',4) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Grooming',1 from public.categories where slug='mens-grooming' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'mens-haircut','Mens haircut','Mens haircut by a verified Nestfix professional.',299,420,30,array['Haircut and styling'],array['Hair colour'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='mens-grooming' and s.name='Grooming'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'haircut-and-beard-trim','Haircut and beard trim','Haircut and beard trim by a verified Nestfix professional.',499,670,45,array['Haircut and beard shaping'],array['Facial'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='mens-grooming' and s.name='Grooming'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'beard-trim','Beard trim','Beard trim by a verified Nestfix professional.',199,300,20,array['Beard shape and line-up'],array['Shave'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='mens-grooming' and s.name='Grooming'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'de-tan-facial-for-men','De-tan facial for men','De-tan facial for men by a verified Nestfix professional.',899,1160,60,array['Cleanse, detan pack'],array['Salon products to keep'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='mens-grooming' and s.name='Grooming'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('massage-spa','Massage & Spa','heart-handshake','#F7E5F0',5) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Relaxation',1 from public.categories where slug='massage-spa' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'relaxing-body-massage-60-min','Relaxing body massage 60 min','Relaxing body massage 60 min by a verified Nestfix professional.',1299,1660,60,array['Full body massage'],array['Shower supplies'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='massage-spa' and s.name='Relaxation'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'deep-tissue-massage','Deep tissue massage','Deep tissue massage by a verified Nestfix professional.',1599,2030,60,array['Focused muscle relief'],array['Medical treatment'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='massage-spa' and s.name='Relaxation'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'foot-reflexology','Foot reflexology','Foot reflexology by a verified Nestfix professional.',649,850,30,array['Foot and calf massage'],array['Pedicure'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='massage-spa' and s.name='Relaxation'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'head-and-shoulder-massage','Head and shoulder massage','Head and shoulder massage by a verified Nestfix professional.',549,730,30,array['Head, neck, shoulders'],array['Hair wash'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='massage-spa' and s.name='Relaxation'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('electrician','Electrician','zap','#FBEDCD',6) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Home electrical',1 from public.categories where slug='electrician' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'switchboard-repair','Switchboard repair','Switchboard repair by a verified Nestfix professional.',249,360,40,array['Loose switch diagnosis'],array['New switch cost'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='electrician' and s.name='Home electrical'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'fan-installation','Fan installation','Fan installation by a verified Nestfix professional.',399,540,50,array['Mount and check'],array['Ceiling drilling extras'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='electrician' and s.name='Home electrical'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'light-fitting-installation','Light fitting installation','Light fitting installation by a verified Nestfix professional.',199,300,30,array['Mount fixture'],array['Fixture cost'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='electrician' and s.name='Home electrical'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'mcb-replacement-labour','MCB replacement labour','MCB replacement labour by a verified Nestfix professional.',299,420,40,array['Safety check, install'],array['MCB part'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='electrician' and s.name='Home electrical'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('plumber','Plumber','wrench','#DCF0F1',7) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Home plumbing',1 from public.categories where slug='plumber' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'tap-repair','Tap repair','Tap repair by a verified Nestfix professional.',249,360,40,array['Leak diagnosis, fitting'],array['Replacement tap'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='plumber' and s.name='Home plumbing'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'drain-unclogging','Drain unclogging','Drain unclogging by a verified Nestfix professional.',549,730,60,array['Unblock basic drain'],array['Pipe replacement'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='plumber' and s.name='Home plumbing'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'flush-tank-repair','Flush tank repair','Flush tank repair by a verified Nestfix professional.',449,610,60,array['Cistern inspection'],array['New tank'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='plumber' and s.name='Home plumbing'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'basin-installation-labour','Basin installation labour','Basin installation labour by a verified Nestfix professional.',699,920,90,array['Mount basin, seal'],array['Basin and fittings'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='plumber' and s.name='Home plumbing'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('carpenter','Carpenter','hammer','#F3E5D7',8) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Woodwork',1 from public.categories where slug='carpenter' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'door-lock-fitting','Door lock fitting','Door lock fitting by a verified Nestfix professional.',449,610,60,array['Lock fitting labour'],array['Lock purchase'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='carpenter' and s.name='Woodwork'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'furniture-assembly','Furniture assembly','Furniture assembly by a verified Nestfix professional.',599,790,75,array['Assembly and levelling'],array['Missing hardware'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='carpenter' and s.name='Woodwork'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'curtain-rod-installation','Curtain rod installation','Curtain rod installation by a verified Nestfix professional.',349,480,45,array['Mount rod brackets'],array['Rod and hooks'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='carpenter' and s.name='Woodwork'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'hinge-repair','Hinge repair','Hinge repair by a verified Nestfix professional.',299,420,40,array['Hinge alignment'],array['Replacement hinge'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='carpenter' and s.name='Woodwork'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('pest-control','Pest Control','bug-off','#EAF0D8',9) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Treatment',1 from public.categories where slug='pest-control' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'cockroach-control-1bhk','Cockroach control 1BHK','Cockroach control 1BHK by a verified Nestfix professional.',999,1290,90,array['Kitchen, bathroom treatment'],array['Severe infestation revisit'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='pest-control' and s.name='Treatment'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'bed-bug-treatment','Bed bug treatment','Bed bug treatment by a verified Nestfix professional.',1799,2280,150,array['Targeted treatment'],array['Linen cleaning'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='pest-control' and s.name='Treatment'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'ant-control','Ant control','Ant control by a verified Nestfix professional.',649,850,60,array['Affected area treatment'],array['Structural repairs'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='pest-control' and s.name='Treatment'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'mosquito-treatment','Mosquito treatment','Mosquito treatment by a verified Nestfix professional.',899,1160,60,array['Indoor fogging'],array['Outdoor treatment'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='pest-control' and s.name='Treatment'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('painting','Painting','paint-roller','#F9E9D9',10) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Wall painting',1 from public.categories where slug='painting' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'single-wall-refresh','Single wall refresh','Single wall refresh by a verified Nestfix professional.',1499,1910,180,array['Prep and one wall coat'],array['Material beyond allowance'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='painting' and s.name='Wall painting'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'room-painting-labour','Room painting labour','Room painting labour by a verified Nestfix professional.',4499,5630,360,array['Two coats standard room'],array['Premium paint'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='painting' and s.name='Wall painting'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'damp-wall-inspection','Damp wall inspection','Damp wall inspection by a verified Nestfix professional.',399,540,45,array['Inspection and quote'],array['Waterproofing'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='painting' and s.name='Wall painting'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'wall-touch-up','Wall touch-up','Wall touch-up by a verified Nestfix professional.',799,1040,90,array['Small patch preparation'],array['Large cracks'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='painting' and s.name='Wall painting'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.categories(slug,name,icon,colour,sort_order) values('appliance-repair','Appliance Repair','refrigerator','#DFEAF1',11) on conflict(slug) do update set name=excluded.name,icon=excluded.icon,colour=excluded.colour,sort_order=excluded.sort_order;
insert into public.subcategories(category_id,name,sort_order) select id,'Appliance care',1 from public.categories where slug='appliance-repair' on conflict(category_id,name) do nothing;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'washing-machine-inspection','Washing machine inspection','Washing machine inspection by a verified Nestfix professional.',299,420,45,array['Diagnosis and quote'],array['Parts'],array['Bestseller'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='appliance-repair' and s.name='Appliance care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'refrigerator-inspection','Refrigerator inspection','Refrigerator inspection by a verified Nestfix professional.',299,420,45,array['Cooling diagnosis'],array['Gas or spares'],array['Popular'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='appliance-repair' and s.name='Appliance care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'ro-filter-replacement-labour','RO filter replacement labour','RO filter replacement labour by a verified Nestfix professional.',399,540,45,array['Filter change labour'],array['Filter kit'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='appliance-repair' and s.name='Appliance care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
insert into public.services(subcategory_id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags)
 select s.id,'geyser-service','Geyser service','Geyser service by a verified Nestfix professional.',499,670,60,array['Descale and safety check'],array['Element replacement'],array['Everyday care'] from public.subcategories s join public.categories c on c.id=s.category_id where c.slug='appliance-repair' and s.name='Appliance care'
 on conflict(slug) do update set price=excluded.price,mrp=excluded.mrp,duration_minutes=excluded.duration_minutes,description=excluded.description,includes=excluded.includes,excludes=excluded.excludes,tags=excluded.tags;
-- Illustrative city override for a common service.
insert into public.city_service_prices(city_id,service_id,price,mrp)
 select c.id,s.id,649,899 from public.cities c cross join public.services s
 where c.slug='mumbai' and s.slug='ac-basic-service'
 on conflict(city_id,service_id) do update set price=excluded.price,mrp=excluded.mrp;
insert into public.settings(key,value,is_public,description) values('visit_fee','49'::jsonb,true,'Visit fee in INR') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('free_visit_threshold','999'::jsonb,true,'Subtotal threshold for waived visit fee in INR') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('gst_rate','0.18'::jsonb,true,'GST rate on visit fee and platform fee') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('platform_fee','0'::jsonb,true,'Platform fee in INR') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('commission_rate','0.2'::jsonb,false,'Professional commission rate') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('cancellation_free_hours','3'::jsonb,true,'Free cancellation window in hours') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('cancellation_fee','100'::jsonb,true,'Late cancellation fee in INR') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('slot_hold_minutes','10'::jsonb,false,'Temporary pro slot hold duration') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.settings(key,value,is_public,description) values('payment_timeout_minutes','15'::jsonb,false,'Unpaid booking expiry') on conflict(key) do update set value=excluded.value,is_public=excluded.is_public,description=excluded.description;
insert into public.coupons(code,type,value,max_discount,min_order,first_order_only,valid_from,valid_to,usage_limit,per_user_limit,is_active)
 values('FIRST20','percent',20,300,299,true,'2025-01-01T00:00:00+05:30','2032-12-31T23:59:59+05:30',10000,1,true)
 on conflict(code) do update set value=excluded.value,max_discount=excluded.max_discount,min_order=excluded.min_order;
insert into public.coupons(code,type,value,max_discount,min_order,first_order_only,valid_from,valid_to,usage_limit,per_user_limit,is_active)
 values('NEST100','flat',100,null,499,false,'2025-01-01T00:00:00+05:30','2032-12-31T23:59:59+05:30',10000,1,true)
 on conflict(code) do update set value=excluded.value,max_discount=excluded.max_discount,min_order=excluded.min_order;
insert into public.coupons(code,type,value,max_discount,min_order,first_order_only,valid_from,valid_to,usage_limit,per_user_limit,is_active)
 values('SAVE250','flat',250,null,2499,false,'2025-01-01T00:00:00+05:30','2032-12-31T23:59:59+05:30',10000,1,true)
 on conflict(code) do update set value=excluded.value,max_discount=excluded.max_discount,min_order=excluded.min_order;
commit;
