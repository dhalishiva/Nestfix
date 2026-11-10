-- Catalog, offers and professionals for launch cities.

insert into public.cities (id, name, sort) values
  ('noida', 'Noida', 1), ('delhi', 'Delhi', 2), ('gurugram', 'Gurugram', 3),
  ('bengaluru', 'Bengaluru', 4), ('mumbai', 'Mumbai', 5);

insert into public.categories (id, name, icon, hue, tagline, sort) values
  ('clean', 'Home Cleaning', 'clean', '#2f7193', 'Deep cleaning by trained 2-person teams', 1),
  ('ac', 'AC Service & Repair', 'ac', '#3a78b5', 'Foam-jet service with a cooling check', 2),
  ('salon', 'Women''s Salon', 'salon', '#a6466c', 'Sealed, single-use kits on every visit', 3),
  ('mens', 'Men''s Grooming', 'mens', '#4a5884', 'Haircuts and grooming at home', 4),
  ('spa', 'Massage & Spa', 'spa', '#5f7d3e', 'Certified therapists bring the table', 5),
  ('elec', 'Electrician', 'elec', '#ad7414', 'Fans, lights, switches and wiring', 6),
  ('plumb', 'Plumber', 'plumb', '#2f7f8a', 'Leaks, taps, drains and fittings', 7),
  ('carp', 'Carpenter', 'carp', '#8b5730', 'Furniture repair and installations', 8),
  ('pest', 'Pest Control', 'pest', '#5a6c33', 'Odourless treatments, safe for kids', 9),
  ('paint', 'Painting', 'paint', '#a24c35', 'Clean, covered, on-time repainting', 10),
  ('appl', 'Appliance Repair', 'appl', '#56606f', 'Washing machine, fridge and RO', 11);

insert into public.services (id, category_id, sub, name, description, price, mrp, duration_min, rating, review_count, includes, excludes, is_bestseller, sort) values
 ('clean-1bhk','clean','Full home','Full home deep cleaning (1 BHK)','A 2-person team cleans every room, kitchen and bathroom with machines and professional chemicals.',3299,3999,270,4.8,41200,'{"Floors scrubbed with a machine","Kitchen and bathrooms degreased","Fans, windows and cabinets wiped"}','{"Inside of cabinets","Wall washing"}',false,1),
 ('clean-2bhk','clean','Full home','Full home deep cleaning (2 BHK)','Our most booked full-home clean for 2 bedroom homes, balcony included.',4499,5299,330,4.8,63100,'{"2-person team with equipment","Balcony included","Inside cabinets on request"}','{"Wall washing","Carpet shampoo"}',true,2),
 ('clean-bath','clean','Bathroom & kitchen','Bathroom deep clean','Removes hard-water stains, scale and grime from tiles, taps and fittings.',549,649,60,4.8,210400,'{"Hard-water stain removal","Tiles, taps and mirrors","Floor scrub and drain clean"}','{"Ceiling cleaning","Repairs to fittings"}',true,3),
 ('clean-kitchen','clean','Bathroom & kitchen','Kitchen deep clean','Degreases the hob, chimney exterior, slab, tiles and sink.',1499,1799,150,4.7,88000,'{"Chimney exterior and hob","Slab, tiles and sink","Cabinet exteriors"}','{"Inside the chimney","Appliance repair"}',false,4),
 ('clean-sofa','clean','Sofa & carpet','Sofa cleaning (per seat)','Vacuum and shampoo for fabric sofas with stain treatment.',199,249,20,4.8,120300,'{"Vacuum and shampoo","Stain treatment","Fast-dry finish"}','{"Leather sofas"}',false,5),
 ('ac-foam','ac','Service','Foam-jet AC service','Deep cleans the indoor unit with foam and water jet for better cooling.',599,749,45,4.8,500200,'{"Indoor unit foam jet","Filter and coil cleaning","Cooling check after service"}','{"Gas refill","Spare parts"}',true,1),
 ('ac-deep','ac','Service','Anti-rust deep clean AC service','Indoor and outdoor unit cleaning with anti-rust coating.',999,1199,90,4.8,96400,'{"Outdoor unit jet wash","Anti-rust coating","Drain pipe flush"}','{"Gas refill","Spare parts"}',false,2),
 ('ac-repair','ac','Repair','AC less or no cooling repair','Diagnosis of cooling problems. Repairs quoted before work starts.',299,399,45,4.7,180000,'{"Diagnosis by a certified technician","Quote before any repair","30-day repair cover"}','{"Spare parts (billed at MRP)","Gas refill"}',false,3),
 ('ac-install','ac','Installation','Split AC installation','Wall mounting, piping up to 3 metres and a leak test.',1399,1599,90,4.8,70100,'{"Wall mount and piping (3 m)","Vacuum and leak test","Demo of the remote"}','{"Extra copper pipe (billed per metre)","Stand or stabiliser"}',false,4),
 ('salon-wax','salon','Waxing','Full arms + legs (Rica)','Rica liposoluble wax, underarms included.',799,949,50,4.8,300500,'{"Rica liposoluble wax","Underarms included","Single-use spatulas"}','{"Bikini waxing"}',true,1),
 ('salon-facial','salon','Facials','O3+ hydrating facial','Cleanse, scrub, mask and massage with a sealed O3+ kit.',1299,1599,75,4.8,140200,'{"Cleanse, scrub and mask","Face and neck massage","Sealed kit opened at home"}','{"Bleach","De-tan"}',false,2),
 ('salon-thread','salon','Threading','Eyebrow + upper lip','Precise threading with a soothing gel finish.',69,90,15,4.9,400100,'{"Precise shaping","Soothing gel after"}','{"Full-face threading"}',true,3),
 ('salon-hairspa','salon','Hair','Hair spa (shoulder length)','Deep conditioning with steam and head massage.',899,1099,60,4.7,52300,'{"Deep conditioning","Steam and head massage"}','{"Hair colour","Haircut"}',false,4),
 ('mens-cut','mens','Haircut','Haircut + beard styling','Haircut and beard shaping with disposable cape and blade.',399,499,45,4.8,220400,'{"Haircut of your choice","Beard shaping","Disposable cape and blade"}','{"Hair colour"}',true,1),
 ('mens-head','mens','Massage','Head massage (20 min)','Relaxing head massage with warm oil.',249,299,20,4.8,90200,'{"Warm oil of your choice","20 minutes"}','{"Shoulder massage"}',false,2),
 ('mens-detan','mens','Facials','De-tan facial','Tan removal pack with a clean-up.',699,849,45,4.7,60100,'{"Tan removal pack","Clean-up included"}','{"Bleach"}',false,3),
 ('spa-swedish','spa','Massage','Swedish full-body massage (60 min)','Medium pressure massage for relaxation.',1599,1899,60,4.8,75300,'{"Medium pressure","Therapist brings table and linen"}','{"Couple massage"}',true,1),
 ('spa-deep','spa','Massage','Deep-tissue massage (90 min)','Firm pressure massage for knots and stiffness.',2399,2799,90,4.8,38200,'{"Firm pressure for knots","Hot towel finish"}','{"Physiotherapy"}',false,2),
 ('elec-fan','elec','Fans','Ceiling fan installation','Mounting, wiring and regulator connection.',149,199,30,4.8,230100,'{"Mounting and wiring","Regulator connection"}','{"Fan and parts","Ceiling drilling for new hooks"}',true,1),
 ('elec-switch','elec','Switches','Switchboard repair','Repair or replace up to 2 switches or sockets.',99,149,30,4.7,160200,'{"Up to 2 switches or sockets","Safety check"}','{"Parts (billed at MRP)"}',false,2),
 ('elec-light','elec','Lights','Light fixture installation','Tube, bulb or panel light installation with drilling.',129,179,30,4.8,110400,'{"Tube, bulb or panel","Drilling included"}','{"Light fixture"}',false,3),
 ('elec-inverter','elec','Inverter','Inverter installation','Wiring to the distribution board and battery connection.',449,549,60,4.7,32100,'{"Wiring to distribution board","Battery connection and test"}','{"Inverter and battery","Extra wire"}',false,4),
 ('plumb-tap','plumb','Taps','Tap repair or replacement','Fix a leaking tap or fit a new one.',99,149,30,4.7,190300,'{"Leak fix or new tap fitting","Washer replacement"}','{"Tap and parts (billed at MRP)"}',true,1),
 ('plumb-drain','plumb','Blockage','Drain blockage removal','Clears blocked sink, basin or floor drains.',249,299,45,4.7,85200,'{"Sink, basin or floor drain","Machine used if needed"}','{"Sewer line work"}',false,2),
 ('plumb-toilet','plumb','Toilet','Toilet or flush tank repair','Fix flush, seat or leak problems.',249,349,45,4.7,70300,'{"Flush, seat or leak","Diagnosis included"}','{"Parts (billed at MRP)"}',false,3),
 ('carp-bed','carp','Furniture','Bed or wardrobe repair','Hinges, channels and handles fixed.',249,299,60,4.7,40100,'{"Hinge, channel or handle","Alignment check"}','{"Parts (billed at MRP)"}',false,1),
 ('carp-curtain','carp','Fixtures','Curtain rod installation','Installs up to 2 curtain rods with anchors.',149,199,30,4.8,60200,'{"Up to 2 rods","Drilling and anchors"}','{"Curtain rods"}',true,2),
 ('carp-lock','carp','Doors','Door lock installation','Mortise or rim lock fitting with alignment check.',199,249,40,4.8,35100,'{"Mortise or rim lock","Alignment check"}','{"Lock"}',false,3),
 ('pest-general','pest','General','General pest control (2 BHK)','Odourless herbal spray for common pests.',1099,1299,60,4.7,64300,'{"Odourless herbal spray","Kitchen and bathrooms","60-day free re-visit"}','{"Termite treatment","Bed bugs"}',false,1),
 ('pest-cockroach','pest','Cockroach','Cockroach gel treatment (2 BHK)','Gel applied in cracks and hinges. No need to leave home.',899,1099,45,4.8,90400,'{"Gel in cracks and hinges","No need to leave home","90-day warranty"}','{"Termite treatment"}',true,2),
 ('pest-termite','pest','Termite','Termite treatment (per 100 sq ft)','Drill-fill-seal treatment with a 1-year warranty.',1499,1799,120,4.6,18200,'{"Drill-fill-seal method","1-year warranty"}','{"Furniture treatment"}',false,3),
 ('paint-room','paint','Rooms','Single room repaint (up to 120 sq ft)','Putty touch-up and 2 coats of premium emulsion. Furniture covered.',4999,5999,480,4.7,12100,'{"Putty touch-up","2 coats of premium emulsion","Furniture covered"}','{"Ceiling","Waterproofing"}',false,1),
 ('paint-consult','paint','Consultation','Painting consultation','A painter visits, advises on colours and gives a written quote.',0,0,30,4.8,25300,'{"Colour advice","Written quote","No obligation"}','{"Painting work"}',false,2),
 ('appl-wm','appl','Washing machine','Washing machine check-up','Diagnosis for front or top load machines.',199,249,45,4.7,150100,'{"Front or top load","Diagnosis and quote"}','{"Spare parts (billed at MRP)"}',false,1),
 ('appl-fridge','appl','Refrigerator','Refrigerator repair','Cooling or noise problems diagnosed and fixed.',199,249,45,4.7,130200,'{"Cooling or noise issue","Diagnosis and quote"}','{"Gas refill","Spare parts"}',false,2),
 ('appl-ro','appl','Water purifier','RO service with filter check','Filter cleaning and TDS test for your RO purifier.',349,449,45,4.8,200300,'{"Filter cleaning","TDS test"}','{"Filter replacement"}',true,3);

insert into public.coupons (code, title, description, kind, value, max_discount, min_order, first_order_only, sort) values
  ('FIRST20', '20% off up to ₹300', 'On your first booking', 'pct', 20, 300, 299, true, 1),
  ('NEST100', 'Flat ₹100 off', 'On orders above ₹499', 'flat', 100, null, 499, false, 2),
  ('SAVE250', 'Flat ₹250 off', 'On orders above ₹2,499', 'flat', 250, null, 2499, false, 3);

-- 12 professionals per city with overlapping skills, so every category has at least 2 people.
with crews(n, skills) as (values
  (1, '{clean,pest}'::text[]), (2, '{clean}'), (3, '{ac,appl}'), (4, '{ac,appl,elec}'),
  (5, '{salon}'), (6, '{salon,spa}'), (7, '{mens,spa}'), (8, '{elec,plumb,carp}'),
  (9, '{plumb,carp}'), (10, '{paint,carp}'), (11, '{pest,clean}'), (12, '{elec,appl}')),
names(arr) as (select array[
  'Rakesh Kumar','Anita Sharma','Imran Khan','Pooja Verma','Suresh Yadav','Neha Gupta','Vikram Singh','Farida Begum',
  'Manoj Tiwari','Sunita Rawat','Ajay Chauhan','Kavita Joshi','Deepak Mishra','Rekha Nair','Sanjay Patel','Meena Iyer',
  'Arif Shaikh','Lata Pillai','Ravi Prasad','Geeta Kaur','Naveen Reddy','Shabnam Ali','Pankaj Saini','Divya Menon',
  'Harish Rao','Asha Thakur','Mohit Bansal','Priya Das','Kamal Hussain','Nisha Bhat'])
insert into public.pros (name, phone, city_id, skills, rating, ratings_count, jobs_done)
select names.arr[1 + ((c.sort * 7 + crews.n * 5) % 30)],
       '98' || lpad(((c.sort * 1000003 + crews.n * 7919) % 100000000)::text, 8, '0'),
       c.id, crews.skills,
       round((4.6 + ((c.sort + crews.n) % 4) * 0.1)::numeric, 1),
       80 + ((c.sort * 37 + crews.n * 53) % 400),
       120 + ((c.sort * 41 + crews.n * 67) % 900)
from public.cities c cross join crews cross join names;
