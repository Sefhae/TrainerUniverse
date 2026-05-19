// Major world cities — used for location autocomplete
const CITIES: string[] = [
  // Turkey
  "Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep", "Konya", "Antalya", "Kayseri", "Mersin",
  "Eskisehir", "Diyarbakir", "Samsun", "Denizli", "Sanliurfa", "Malatya", "Trabzon", "Erzurum", "Van", "Tekirdag",
  // USA
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",
  "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Indianapolis",
  "San Francisco", "Seattle", "Denver", "Nashville", "Oklahoma City", "El Paso", "Washington DC", "Las Vegas",
  "Louisville", "Memphis", "Portland", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento",
  "Mesa", "Kansas City", "Atlanta", "Omaha", "Colorado Springs", "Raleigh", "Long Beach", "Virginia Beach",
  "Minneapolis", "Tampa", "New Orleans", "Arlington", "Wichita", "Bakersfield", "Aurora", "Anaheim", "Santa Ana",
  "Corpus Christi", "Riverside", "St. Louis", "Lexington", "Pittsburgh", "Stockton", "Anchorage", "Cincinnati",
  "St. Paul", "Greensboro", "Toledo", "Newark", "Plano", "Henderson", "Lincoln", "Orlando", "Jersey City",
  "Chandler", "St. Petersburg", "Laredo", "Norfolk", "Madison", "Durham", "Lubbock", "Winston-Salem",
  "Garland", "Glendale", "Hialeah", "Reno", "Baton Rouge", "Irvine", "Chesapeake", "Scottsdale", "North Las Vegas",
  "Fremont", "Gilbert", "San Bernardino", "Birmingham", "Rochester", "Richmond", "Spokane", "Des Moines",
  "Montgomery", "Modesto", "Fayetteville", "Tacoma", "Shreveport", "Fontana", "Moreno Valley", "Glendale",
  "Akron", "Yonkers", "Huntington Beach", "Little Rock", "Columbus", "Augusta", "Grand Rapids", "Oxnard",
  "Salt Lake City", "Tallahassee", "Huntsville", "Worcester", "Knoxville", "Providence", "Fort Lauderdale",
  "Brownsville", "Tempe", "Chattanooga", "Newport News", "Overland Park", "Santa Clarita", "Garden Grove",
  "Oceanside", "Fort Collins", "Elk Grove", "Vancouver WA", "Salem", "Eugene", "Peoria", "Corona", "Hayward",
  "Clarksville", "Paterson", "Salinas", "Springfield", "Pomona", "Escondido", "Kansas City KS", "Sunnyvale",
  "Torrance", "Alexandria", "Rockford", "Surprise", "Pasadena", "Roseville", "Macon", "Savannah",
  "Sioux Falls", "Jackson", "Dayton", "Bridgeport", "Harlingen", "Murfreesboro", "Columbia SC", "Denton",
  "Fort Wayne", "Mesquite", "Cary", "Killeen", "Waco", "Hampton", "Lakewood", "McAllen", "Naperville",
  "Syracuse", "Shreveport", "Warren", "Visalia", "Midland", "Bellevue", "Olathe", "Sterling Heights",
  "Gainesville", "Carrollton", "Coral Springs", "Thousand Oaks", "Simi Valley", "West Valley City",
  "Columbia MO", "Concord", "Hartford", "Cedar Rapids", "Wilmington", "Peoria IL", "Elizabeth", "Stamford",
  "Paterson", "Cape Coral", "Palmdale", "Escondido", "Hayward", "Syracuse", "Alexandria VA",
  // UK
  "London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh",
  "Bristol", "Cardiff", "Leicester", "Coventry", "Nottingham", "Newcastle upon Tyne", "Belfast", "Hull",
  "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Southampton", "Portsmouth", "Reading", "Northampton",
  "Sunderland", "Aberdeen", "Luton", "Oxford", "Brighton", "Cambridge", "Swansea", "Dundee", "Milton Keynes",
  "Norwich", "Peterborough", "Swindon", "Middlesbrough", "Bolton", "Southend-on-Sea", "Colchester", "Exeter",
  "Ipswich", "Cheltenham", "York", "Blackpool", "Barnsley", "Warrington", "Telford",
  // Germany
  "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Leipzig", "Dortmund",
  "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
  "Bonn", "Munster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden", "Gelsenkirchen", "Monchengladbach",
  "Braunschweig", "Kiel", "Chemnitz", "Aachen", "Halle", "Magdeburg", "Freiburg", "Krefeld", "Lubeck",
  "Oberhausen", "Erfurt", "Mainz", "Rostock", "Kassel", "Hagen", "Hamm", "Saarbrucken",
  // France
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux",
  "Lille", "Rennes", "Reims", "Le Havre", "Saint-Etienne", "Toulon", "Grenoble", "Dijon", "Angers",
  "Nimes", "Villeurbanne", "Clermont-Ferrand", "Le Mans", "Aix-en-Provence", "Brest", "Tours", "Amiens",
  "Limoges", "Annecy", "Perpignan", "Boulogne-Billancourt", "Metz", "Besancon", "Orleans", "Rouen",
  // Spain
  "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga", "Murcia", "Palma", "Las Palmas",
  "Bilbao", "Alicante", "Cordoba", "Valladolid", "Vigo", "Gijon", "Hospitalet de Llobregat", "Vitoria",
  "Granada", "Elche", "Oviedo", "Badalona", "Cartagena", "Terrassa", "Jerez", "Sabadell", "Santa Cruz de Tenerife",
  "Pamplona", "Almeria", "Fuenlabrada", "Mostoles", "Alcala de Henares", "San Sebastian", "Leganes",
  // Italy
  "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania",
  "Venice", "Verona", "Messina", "Padua", "Trieste", "Taranto", "Brescia", "Reggio Calabria", "Prato",
  "Modena", "Reggio Emilia", "Perugia", "Livorno", "Ravenna", "Cagliari", "Foggia", "Rimini", "Salerno",
  "Ferrara", "Sassari", "Latina", "Giugliano in Campania", "Monza", "Bergamo", "Syracuse",
  // Portugal
  "Lisbon", "Porto", "Amadora", "Braga", "Setubal", "Coimbra", "Funchal", "Almada", "Agualva-Cacem",
  "Queluz", "Aveiro", "Barreiro", "Viseu", "Guimaraes", "Evora", "Faro",
  // Netherlands
  "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda",
  "Nijmegen", "Enschede", "Apeldoorn", "Haarlem", "Zaandam", "Amersfoort", "Haarlemmermeer", "Dordrecht",
  "Leiden", "Zoetermeer", "Zwolle", "Maastricht", "Delft", "Westland", "Alkmaar",
  // Belgium
  "Brussels", "Antwerp", "Ghent", "Charleroi", "Liege", "Bruges", "Namur", "Leuven", "Mons", "Aalst",
  "Mechelen", "La Louviere", "Kortrijk", "Hasselt", "Ostend", "Sint-Niklaas", "Tournai",
  // Switzerland
  "Zurich", "Geneva", "Basel", "Lausanne", "Bern", "Winterthur", "Lucerne", "St. Gallen", "Lugano",
  "Biel", "Thun", "Koniz", "La Chaux-de-Fonds", "Schaffhausen", "Fribourg", "Chur", "Vernier",
  // Austria
  "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "St. Polten", "Dornbirn",
  // Poland
  "Warsaw", "Krakow", "Lodz", "Wroclaw", "Poznan", "Gdansk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice",
  "Bialystok", "Gdynia", "Czestochowa", "Radom", "Sosnowiec", "Torun", "Kielce", "Rzeszow", "Gliwice",
  // Czech Republic
  "Prague", "Brno", "Ostrava", "Plzen", "Liberec", "Olomouc", "Usti nad Labem", "Ceske Budejovice", "Hradec Kralove",
  // Hungary
  "Budapest", "Debrecen", "Miskolc", "Szeged", "Pecs", "Gyor", "Nyiregyhaza", "Kecskemet", "Szekesfehervar",
  // Romania
  "Bucharest", "Cluj-Napoca", "Timisoara", "Iasi", "Constanta", "Craiova", "Galati", "Brasov", "Ploiesti",
  "Braila", "Oradea", "Bacau", "Arad", "Pitesti", "Sibiu", "Targu Mures",
  // Greece
  "Athens", "Thessaloniki", "Patras", "Piraeus", "Larissa", "Heraklion", "Peristeri", "Kallithea", "Nikaia",
  "Volos", "Nea Smyrni", "Ilio", "Chanania", "Iraklio", "Rhodes", "Ioannina",
  // Sweden
  "Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras", "Orebro", "Linkoping", "Helsingborg", "Jonkoping",
  "Norrkoping", "Lund", "Umea", "Gavle", "Boras", "Sodertaije", "Eskilstuna",
  // Norway
  "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Sandnes", "Sarpsborg",
  "Skien", "Askoy", "Akershus", "Baerum",
  // Denmark
  "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde",
  // Finland
  "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyvaskyla", "Lahti", "Kuopio", "Kouvola",
  // Russia
  "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Nizhny Novgorod", "Kazan", "Chelyabinsk",
  "Omsk", "Samara", "Rostov-on-Don", "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar",
  "Saratov", "Tyumen", "Tolyatti", "Izhevsk", "Barnaul", "Ulyanovsk", "Irkutsk", "Khabarovsk", "Yaroslavl",
  "Vladivostok", "Makhachkala", "Tomsk", "Orenburg", "Kemerovo", "Novokuznetsk", "Ryazan", "Astrakhan",
  // Ukraine
  "Kyiv", "Kharkiv", "Odessa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih", "Mykolaiv",
  "Mariupol", "Luhansk", "Vinnytsia", "Poltava", "Simferopol", "Chernivtsi", "Kherson", "Khmelnytskyi",
  // Canada
  "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton",
  "Kitchener", "London ON", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon", "Regina", "Kelowna",
  "Barrie", "Abbotsford", "Greater Sudbury", "Kingston", "Saguenay", "Sherbrooke", "Gatineau", "Burnaby",
  "Richmond BC", "Richmond Hill", "Markham", "Vaughan", "Laval", "Brampton", "Mississauga", "Surrey",
  // Australia
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Sunshine Coast",
  "Wollongong", "Geelong", "Hobart", "Townsville", "Cairns", "Darwin", "Toowoomba", "Ballarat", "Bendigo",
  "Albury", "Launceston", "Mackay", "Rockhampton", "Bunbury", "Bundaberg", "Coffs Harbour",
  // New Zealand
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier-Hastings", "Dunedin", "Palmerston North",
  "Nelson", "Rotorua", "New Plymouth", "Whangarei", "Invercargill",
  // Japan
  "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Fukuoka", "Kawasaki", "Kyoto", "Saitama",
  "Hiroshima", "Sendai", "Kitakyushu", "Chiba", "Setagaya", "Sakai", "Niigata", "Hamamatsu", "Sagamihara",
  "Shizuoka", "Kumamoto", "Okayama", "Kagoshima", "Higashiosaka", "Funabashi", "Hachioji", "Matsuyama",
  "Nara", "Oita", "Kanazawa", "Toyota", "Utsunomiya", "Matsudo", "Nagasaki", "Amagasaki", "Ichikawa",
  "Suita", "Himeji", "Kawaguchi", "Takatsuki", "Nishinomiya",
  // China
  "Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Chengdu", "Tianjin", "Wuhan", "Xi'an", "Hangzhou",
  "Nanjing", "Chongqing", "Qingdao", "Shenyang", "Zhengzhou", "Jinan", "Changsha", "Harbin", "Kunming",
  "Dalian", "Dongguan", "Nanchang", "Hefei", "Taiyuan", "Xiamen", "Wenzhou", "Shijiazhuang", "Fuzhou",
  "Zibo", "Wuxi", "Guiyang", "Urumqi", "Foshan", "Zhongshan", "Changchun", "Nanning", "Ningbo",
  "Suzhou", "Tangshan", "Lanzhou", "Xuzhou", "Changzhou", "Haikou", "Jilin", "Luoyang", "Qiqihar",
  "Yantai", "Nantong", "Huai'an", "Weifang", "Ordos", "Shantou", "Baotou", "Jinhua", "Handan",
  "Wuhu", "Shaoxing", "Liuzhou", "Zhuhai", "Zhangjiajie", "Chaozhou", "Jiaxing", "Taizhou",
  // South Korea
  "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Seongnam", "Goyang",
  "Yongin", "Bucheon", "Changwon", "Ansan", "Jeonju", "Cheongju", "Anyang", "Pohang", "Uijeongbu",
  "Namyangju", "Hwaseong", "Gimhae", "Masan", "Gumi", "Pyeongtaek", "Jinju",
  // India
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune",
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Coimbatore", "Agra", "Madurai", "Nashik", "Vijayawada", "Rajkot", "Meerut",
  "Faridabad", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad", "Ranchi",
  "Howrah", "Gwalior", "Jabalpur", "Jodhpur", "Raipur", "Kota", "Guwahati", "Solapur", "Hubballi-Dharwad",
  "Tiruchirappalli", "Thiruvananthapuram", "Mysore", "Bareilly", "Moradabad", "Salem", "Tiruppur",
  "Gorakhpur", "Aligarh", "Jalandhar", "Bhubaneswar", "Saharanpur", "Warangal", "Guntur",
  // Pakistan
  "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Peshawar", "Multan", "Hyderabad PK",
  "Islamabad", "Quetta", "Bahawalpur", "Sargodha", "Sialkot", "Sukkur", "Larkana", "Sheikhupura",
  "Jhang", "Rahim Yar Khan", "Gujrat", "Kasur",
  // Bangladesh
  "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Comilla", "Narayanganj", "Gazipur",
  // Indonesia
  "Jakarta", "Surabaya", "Bandung", "Medan", "Bekasi", "Tangerang", "Depok", "Palembang", "Semarang",
  "Makassar", "South Tangerang", "Batam", "Bogor", "Pekanbaru", "Bandar Lampung", "Padang", "Manado",
  "Malang", "Samarinda", "Balikpapan", "Tasikmalaya", "Banjarmasin", "Pontianak", "Denpasar",
  // Philippines
  "Manila", "Quezon City", "Caloocan", "Davao", "Cebu City", "Zamboanga", "Antipolo", "Taguig", "Pasig",
  "Cagayan de Oro", "Paranaque", "Valenzuela", "Las Pinas", "Makati", "Bacolod", "General Santos",
  // Vietnam
  "Ho Chi Minh City", "Hanoi", "Da Nang", "Haiphong", "Bien Hoa", "Can Tho", "Thu Duc", "Nha Trang",
  "Buon Ma Thuot", "Hue", "Vung Tau", "Da Lat", "Quy Nhon",
  // Thailand
  "Bangkok", "Nonthaburi", "Pak Kret", "Hat Yai", "Chiang Mai", "Pattaya", "Nakhon Ratchasima", "Udon Thani",
  "Chon Buri", "Khon Kaen", "Nakhon Si Thammarat", "Phuket",
  // Malaysia
  "Kuala Lumpur", "Subang Jaya", "Johor Bahru", "Ipoh", "Petaling Jaya", "Shah Alam", "Klang", "Ampang Jaya",
  "Seremban", "Malacca City", "Kota Kinabalu", "Kuching", "George Town", "Taiping", "Miri",
  // Singapore
  "Singapore",
  // Myanmar
  "Naypyidaw", "Yangon", "Mandalay", "Mawlamyine", "Bago", "Pathein", "Monywa", "Sittwe",
  // Cambodia
  "Phnom Penh", "Siem Reap", "Preah Sihanouk", "Battambang",
  // Nepal
  "Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Birganj", "Biratnagar",
  // Sri Lanka
  "Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Jaffna", "Kandy", "Negombo",
  // Iran
  "Tehran", "Mashhad", "Isfahan", "Karaj", "Tabriz", "Shiraz", "Qom", "Ahvaz", "Kermanshah", "Urmia",
  "Rasht", "Kerman", "Zahedan", "Hamadan", "Arak", "Yazd", "Ardabil", "Bandar Abbas", "Qazvin", "Zanjan",
  // Iraq
  "Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala", "Kirkuk", "Sulaymaniyah", "Ramadi", "Tikrit",
  // Saudi Arabia
  "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Hofuf", "Taif", "Buraidah",
  "Muwayh", "Khamis Mushait", "Ha'il", "Jubayl", "Najran",
  // UAE
  "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras al-Khaimah", "Fujairah", "Umm al-Quwain",
  // Qatar
  "Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Mesaieed",
  // Kuwait
  "Kuwait City", "Salmiya", "Hawalli", "Ahmadi", "Farwaniyah",
  // Bahrain
  "Manama", "Riffa", "Muharraq", "Hamad Town",
  // Oman
  "Muscat", "Seeb", "Salalah", "Bawshar", "Sohar", "Nizwa",
  // Jordan
  "Amman", "Zarqa", "Irbid", "Russeifa", "Aqaba",
  // Lebanon
  "Beirut", "Tripoli LB", "Sidon", "Tyre", "Jounieh",
  // Israel
  "Jerusalem", "Tel Aviv", "West Jerusalem", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya",
  "Beer Sheva", "Bnei Brak", "Holon", "Bat Yam", "Rehovot", "Ramat Gan",
  // Egypt
  "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said", "Suez", "Luxor", "Mansura", "El-Mahalla El-Kubra",
  "Tanta", "Asyut", "Ismailia", "Fayyum", "Zagazig", "Aswan", "Damietta", "Damanhur", "Minya",
  // Morocco
  "Casablanca", "Fez", "Tangier", "Marrakech", "Sale", "Meknes", "Rabat", "Oujda", "Kenitra", "Agadir",
  "Tetouan", "Safi", "El Jadida", "Mohammedia", "Beni Mellal",
  // Algeria
  "Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Tebessa", "Setif", "Sidi Bel Abbes",
  "Biskra", "Djelfa", "Jijel", "Skikda", "Bejaia",
  // Tunisia
  "Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Gabes", "Bizerte", "Gafsa", "Aryanah",
  // Libya
  "Tripoli", "Benghazi", "Misrata", "Tarhuna", "Zawiya",
  // Sudan
  "Khartoum", "Omdurman", "Khartoum North", "Kassala", "Port Sudan", "Obeid", "Atbara",
  // Ethiopia
  "Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Adama", "Hawassa", "Bahir Dar", "Dessie",
  // Kenya
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Ruiru", "Kikuyu", "Kangundo-Tala",
  // Nigeria
  "Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba",
  "Jos", "Ilorin", "Oyo", "Enugu", "Abeokuta", "Onitsha", "Warri", "Kaduna", "Ogbomosho",
  // South Africa
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Pietermaritzburg", "Benoni",
  "Tembisa", "East London", "Vereeniging", "Bloemfontein", "Boksburg", "Welkom", "Newcastle", "Krugersdorp",
  "Soweto", "Randburg", "Midrand", "Centurion",
  // Ghana
  "Accra", "Kumasi", "Tamale", "Takoradi", "Ashaiman", "Cape Coast",
  // Tanzania
  "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Zanzibar City", "Tanga",
  // Uganda
  "Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Bwizibwera",
  // Zimbabwe
  "Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru",
  // Zambia
  "Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola",
  // Cameroon
  "Douala", "Yaounde", "Garoua", "Bamenda", "Maroua",
  // Senegal
  "Dakar", "Touba", "Pikine", "Thies",
  // Ivory Coast
  "Abidjan", "Bouake", "Daloa", "Yamoussoukro",
  // Brazil
  "Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus",
  "Curitiba", "Recife", "Porto Alegre", "Belem", "Goiania", "Guarulhos", "Campinas", "Sao Luis",
  "Maceio", "Natal", "Teresina", "Campo Grande", "Nova Iguacu", "Duque de Caxias", "Osasco",
  "Sao Bernardo do Campo", "Sao Jose dos Campos", "Santos", "Uberlandia", "Contagem",
  "Joao Pessoa", "Ribeiro Preto", "Sorocaba", "Cuiaba", "Juiz de Fora", "Macapa", "Aparecida de Goiania",
  "Florianopolis", "Joinville", "Feira de Santana", "Londrina", "Ananindeua", "Porto Velho",
  "Caxias do Sul", "Campos dos Goytacazes", "Belford Roxo", "Sao Jose do Rio Preto",
  // Argentina
  "Buenos Aires", "Cordoba AR", "Rosario", "Mendoza", "La Plata", "Tucuman", "Mar del Plata",
  "Salta", "Santa Fe", "San Juan", "Resistencia", "Mision", "Neuquen", "Formosa", "San Luis",
  // Colombia
  "Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena CO", "Cucuta", "Bucaramanga", "Soledad",
  "Ibague", "Pereira", "Santa Marta", "Manizales", "Bello",
  // Peru
  "Lima", "Arequipa", "Trujillo", "Chiclayo", "Iquitos", "Piura", "Callao", "Cusco", "Chimbote",
  "Huancayo", "Tacna", "Juliaca",
  // Venezuela
  "Caracas", "Maracaibo", "Valencia VE", "Barquisimeto", "Ciudad Guayana", "San Cristobal",
  "Maturin", "Barcelona VE", "Barinas", "Merida VE",
  // Chile
  "Santiago", "Valparaiso", "Antofagasta", "Vina del Mar", "Temuco", "Rancagua", "Talca", "Arica",
  "Talcahuano", "Iquique", "Concepcion", "San Bernardo", "Puente Alto",
  // Ecuador
  "Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo",
  // Bolivia
  "Santa Cruz de la Sierra", "El Alto", "La Paz", "Cochabamba", "Sucre", "Oruro",
  // Uruguay
  "Montevideo", "Salto", "Ciudad de la Costa", "Paysandu",
  // Paraguay
  "Asuncion", "Ciudad del Este", "San Lorenzo",
  // Mexico
  "Mexico City", "Ecatepec", "Guadalajara", "Puebla", "Juarez", "Tijuana", "Leon", "Monterrey",
  "Zapopan", "Nezahualcoyotl", "Chihuahua", "Naucalpan", "Merida", "San Luis Potosi", "Aguascalientes",
  "Tlalnepantla de Baz", "Acapulco", "Culiacan", "Torreon", "Morelia", "Queretaro", "Mexicali",
  "Hermosillo", "Cancun", "Saltillo", "Tlaquepaque", "Tuxtla Gutierrez", "Durango", "Veracruz",
  "Acapulco", "Ciudad Lopez Mateos", "Oaxaca de Juarez", "Torreon",
  // Cuba
  "Havana", "Santiago de Cuba", "Camaguey", "Holguin", "Santa Clara", "Guantanamo",
  // Guatemala
  "Guatemala City", "Villa Nueva", "Quetzaltenango", "San Juan Sacatepequez",
  // Honduras
  "Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choloma",
  // El Salvador
  "San Salvador", "Soyapango", "Santa Ana", "San Miguel",
  // Costa Rica
  "San Jose CR", "Cartago", "Liberia CR",
  // Panama
  "Panama City", "San Miguelito", "Tocumen",
  // Dominican Republic
  "Santo Domingo", "Santiago DO", "La Romana", "San Pedro de Macoris",
  // Haiti
  "Port-au-Prince", "Cap-Haitien", "Gonaives",
  // Jamaica
  "Kingston", "Spanish Town", "Montego Bay",
  // Puerto Rico
  "San Juan PR", "Bayamon", "Carolina PR", "Ponce",
  // Kazakhstan
  "Almaty", "Nur-Sultan", "Shymkent", "Karaganda", "Aktobe", "Taraz", "Pavlodar", "Ust-Kamenogorsk",
  // Uzbekistan
  "Tashkent", "Namangan", "Samarkand", "Andijan", "Bukhara", "Nukus",
  // Azerbaijan
  "Baku", "Ganja", "Sumgait", "Mingachevir",
  // Georgia
  "Tbilisi", "Kutaisi", "Rustavi", "Batumi",
  // Armenia
  "Yerevan", "Gyumri", "Vanadzor",
  // Kyrgyzstan
  "Bishkek", "Osh",
  // Tajikistan
  "Dushanbe", "Khujand",
  // Turkmenistan
  "Ashgabat", "Turkmenbashi",
  // Afghanistan
  "Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Kunduz", "Jalalabad",
  // North Africa / Sahel
  "Khartoum", "Tripoli", "Tunis",
  // Taiwan
  "Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu", "Keelung", "Zhongli",
  // Hong Kong
  "Hong Kong",
  // Macau
  "Macau",
  // North Korea
  "Pyongyang", "Hamhung", "Chongjin",
  // Mongolia
  "Ulaanbaatar", "Erdenet", "Darkhan",
  // Cambodia
  "Phnom Penh", "Siem Reap",
  // Laos
  "Vientiane", "Pakse", "Savannakhet",
  // Brunei
  "Bandar Seri Begawan",
  // East Timor
  "Dili",
  // Papua New Guinea
  "Port Moresby", "Lae", "Arawa",
  // Fiji
  "Suva", "Lautoka",
  // Solomon Islands
  "Honiara",
  // Vanuatu
  "Port Vila",
  // Iceland
  "Reykjavik", "Kopavogur", "Hafnarfjordur",
  // Luxembourg
  "Luxembourg City",
  // Malta
  "Valletta", "Birkirkara", "Qormi",
  // Cyprus
  "Nicosia", "Limassol", "Larnaca", "Famagusta",
  // Slovakia
  "Bratislava", "Kosice", "Presov", "Nitra", "Zilina",
  // Slovenia
  "Ljubljana", "Maribor", "Celje", "Kranj",
  // Croatia
  "Zagreb", "Split", "Rijeka", "Osijek", "Zadar",
  // Bosnia and Herzegovina
  "Sarajevo", "Banja Luka", "Mostar", "Tuzla",
  // Serbia
  "Belgrade", "Novi Sad", "Nis", "Kragujevac", "Subotica",
  // North Macedonia
  "Skopje", "Bitola", "Kumanovo",
  // Albania
  "Tirana", "Durres", "Vlore", "Shkoder",
  // Montenegro
  "Podgorica", "Niksic",
  // Kosovo
  "Pristina", "Prizren",
  // Moldova
  "Chisinau", "Tiraspol", "Balti",
  // Belarus
  "Minsk", "Gomel", "Mogilev", "Vitebsk", "Grodno", "Brest BY",
  // Lithuania
  "Vilnius", "Kaunas", "Klaipeda", "Siauliai", "Panevezys",
  // Latvia
  "Riga", "Daugavpils", "Liepaja", "Jelgava",
  // Estonia
  "Tallinn", "Tartu", "Narva", "Parnu",
  // Ireland
  "Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda",
  // Israel / Palestine
  "Ramallah", "Gaza", "Nablus", "Hebron",
  // Yemen
  "Sanaa", "Aden", "Taiz", "Al Hudaydah", "Ibb", "Mukalla",
  // Syria
  "Damascus", "Aleppo", "Homs", "Latakia", "Hama", "Deir ez-Zor",
  // Angola
  "Luanda", "Huambo", "Lobito", "Benguela", "Kuito",
  // Mozambique
  "Maputo", "Matola", "Beira", "Nampula", "Chimoio",
  // Madagascar
  "Antananarivo", "Toamasina", "Antsirabe", "Mahajanga",
  // Cameroon / West Africa
  "Yaounde", "Douala", "Dakar", "Bamako", "Conakry", "Freetown", "Monrovia", "Abidjan", "Accra",
  "Lome", "Cotonou", "Lagos", "Ibadan", "Kano",
  // Chad
  "N'Djamena",
  // Mali
  "Bamako", "Sikasso", "Segou", "Mopti",
  // Niger
  "Niamey", "Zinder", "Maradi",
  // Burkina Faso
  "Ouagadougou", "Bobo-Dioulasso",
  // Guinea
  "Conakry", "Nzerekore", "Kankan",
  // Togo
  "Lome", "Sokode",
  // Benin
  "Cotonou", "Porto-Novo", "Parakou",
  // Sierra Leone
  "Freetown", "Bo", "Kenema",
  // Liberia
  "Monrovia", "Gbarnga",
  // Guinea-Bissau
  "Bissau",
  // Gambia
  "Banjul", "Serekunda",
  // Rwanda
  "Kigali", "Butare", "Gitarama",
  // Burundi
  "Bujumbura", "Muyinga",
  // DRC
  "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Kananga", "Goma",
  // Congo
  "Brazzaville", "Pointe-Noire",
  // Gabon
  "Libreville", "Port-Gentil",
  // Equatorial Guinea
  "Malabo",
  // Central African Republic
  "Bangui",
  // Somalia
  "Mogadishu", "Hargeisa", "Berbera",
  // Djibouti
  "Djibouti City",
  // Eritrea
  "Asmara",
  // Malawi
  "Lilongwe", "Blantyre", "Mzuzu",
  // Namibia
  "Windhoek", "Walvis Bay",
  // Botswana
  "Gaborone", "Francistown",
  // Lesotho
  "Maseru",
  // Swaziland/Eswatini
  "Mbabane", "Manzini",
  // Comoros
  "Moroni",
  // Mauritius
  "Port Louis",
  // Reunion
  "Saint-Denis",
];

export default CITIES;
