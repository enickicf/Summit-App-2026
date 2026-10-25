import type { AirtablePerson } from "./airtable";

// Reviewed fallback of Airtable's Guest Tracker, synchronized October 24, 2026. Production uses
// this copy when AIRTABLE_TOKEN is unavailable. Attendance status, Website Grouping, title, bio and
// headshot presence match Airtable; locally saved portraits prevent expiring attachment links.
export type RecordedAirtablePerson = AirtablePerson & { headshotFile?: string };
export const airtableTalentRecordedAt = "2026-10-24";
export const airtableTalent2026: RecordedAirtablePerson[] = [
  {
    "recordId": "rec1M288OYcpaWTDb",
    "name": "Jason Kennedy",
    "status": "Confirmed Attendance",
    "groups": [
      "Summit Host",
      "A-Talent",
      "7"
    ],
    "occupation": "Host",
    "organization": "",
    "title": "Television Host & Producer",
    "bio": "Jason Kennedy was born in Fort Lauderdale, Florida. When he was 12, he produced a mock television news program from his custom built home studio. At 15, Jason was selling news footage to local crews when he arrived at the scene early. After graduating from the University of Miami, Kennedy moved to Los Angeles and within 6 months landed a job with the E! Network. He spent 18 amazing years at E! as the host of E! News and Live From The Red Carpet. He’s been a long time contributor to NBC’s “Today” show and has covered some of the biggest stories around the world. He recently wrapped guest hosting and doing high profile interviews on Access Hollywood and E! News. His golf show “Swing By” gives fans an inside look at PGA Tour athletes at their homes, it premiered on NBC. His latest show Pop Exchange airs weekly on Youtube covering the latest on all things pop culture. Kennedy is also busy behind the scenes as an Executive Producer with past projects at “The Oprah Winfrey Network” and “Oxygen.” Jason and his wife Lauren live just outside of Los Angeles with their son Ryver Rhodes, daughter Poppy Ford and labradoodle Bennett.",
    "hasHeadshot": true,
    "headshotBytes": 259639,
    "headshotFile": "/2026-headshots/portraits/jason-kennedy-2.jpg"
  },
  {
    "recordId": "recDB1UbsaH1tYlN7",
    "name": "Loni Love",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent",
      "Awards Host",
      "6"
    ],
    "occupation": "Comedian",
    "organization": "",
    "title": "Comedian & TV Host",
    "bio": "Loni is a 2x EMMY & NAACP Image Award-winning entertainer, author, and activist. She holds a B.S. in Electrical Engineering & Presidential Medal from her beloved Prairie View A&M University. Loni enjoys inspiring and encouraging audiences with her wit while giving an authentic point of view. A talk show host known for her dynamic ability to provide in-depth meaningful conversation with a hint of levity, Loni is a co-host for The Live from E! Red carpet specials. She was a guest cohost on E!'s Daily Pop and Nightly Pop. She has interviewed top A-List entertainers such as Melissa McCarthy, Issa Rae, and others. Loni cohosted FOX's The REAL Daytime for 8 seasons in which she interviewed high-profile guests from Vice President Kamala Harris, Tracee Ellis Ross, Idris Elba and more.\n\nLoni currently co-hosts the GRACIE Award-winning weekend radio show Café Mocha with rapper Yo-Yo. She has interviewed a variety of guests such as President Obama and the First Lady Michelle Obama as well as superstars like Fantasia Barrino Taylor, Patti LaBelle, John Legend, Tyler Perry, Jam & Terry among many others. Café Mocha is the only nationally syndicated show of its kind that was created exclusively BY and FOR women of color. The show is broadcast on over 35 stations including SiriusXM Channel 141.\n\nLoni is a multi-hyphenated entertainer. She was a recurring guest star in the HBO-Max sitcom \"The Gordita Chronicles\". Additionally, Loni is the Executive Producer of Little Women Unfiltered: Atlanta, an after show for Little Women: Atlanta, season six on Lifetime. Loni was also the host of the highly rated post Salt-N-Peppa movie interview with the real legendary artists on Lifetime. She is also the new first narrator for the 13th season of Bridezillas on WETV. Loni has also Executive Produced a series of specials titled \"Salute Her Awards\" dedicated to honoring different women across the United States.\n\nIn addition, she served as the solo host for the 2020 and 2021 Daytime Emmys Children's, Lifestyle and Animations Award Ceremony. Loni has appeared in myriad movies including Mother's Day, the successful Paul Blart Mall Cop 2 opposite Kevin James, Soul Plane with Kevin Hart, the Bad Ass franchise with Danny Glover and Danny Trejo and Adopt A Highway alongside Ethan Hawke.\n\nLoni is the subject of the documentary \"Being Loni Love\", which traces her life story from her early days as a latchkey daughter growing up in Detroit's Brewster-Douglas housing projects to national stand-up comedienne and successful host/actress. Author, stand up comedienne, theatre actor, film star, television host, roving reporter, and part time aunt.\n\nIn 2019, she became the first female host on the mainstage of the Essence Music Festival in the Superdome in New Orleans. In 2020 she also hosted the first-ever virtual festival celebrating the magazine's 50th anniversary. In 2023 Loni was the first female comedian to headline the David Koz International cruise.\n\nA philanthropist, Loni is an ambassador for Michelle Obama's When We All Vote, NAACP, LA Mission, Dress for Success, Reach Higher, LA Regional Food Bank, Project Angel Food, Girl Scouts and the UNCF to name a few. She is a proud Detroiter and is a frequent speaker for organizations in her hometown. Loni was requested to give opening remarks for VP Harris in the organization Made To Save 2021 vaccine pop up event in Detroit. Loni also had a special moment as the 2020 commencement speaker for her high school alma mater, Cass Tech. Loni believes in the power of education and supporting HBCUs. She is a proud member of Delta Sigma Theta Sorority, Inc. Due to her work as alumni of PVAMU and constantly using her platform to promote HBCUs, Loni was awarded the rare honor of the Presidential Medal from PVAMU.\n\nLoni's second book, \"I Tried To Change So You Don't Have To: True Life Lessons\" debuted in June 2020 and received a glowing review from the New York Times. The book is an inspiring, hilarious memoir about learning to resist the pressures of conformity, love yourself for who you are, embrace your flaws, and unlock your true potential. It is now available at www.LoniLoveBook.com.",
    "hasHeadshot": true,
    "headshotBytes": 886710,
    "headshotFile": "/2026-headshots/portraits/loni-love-2.jpg"
  },
  {
    "recordId": "recdS1vYczdSPx1PV",
    "name": "Anthony Ramos",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent",
      "9"
    ],
    "occupation": "Actor, Musician",
    "organization": "",
    "title": "Actor, Singer & Grammy Award Winner",
    "bio": "Anthony Ramos is a Golden Globe- and Emmy-nominated actor and Grammy Award-winning recording artist. He originated the roles of John Laurens and Philip Hamilton in the Broadway phenomenon Hamilton and has starred in In the Heights, A Star Is Born, Transformers: Rise of the Beasts and Twisters. Through his work across film, theater and music, Ramos has become a powerful advocate for authentic Latino representation.",
    "hasHeadshot": true,
    "headshotBytes": 290862,
    "headshotFile": "/2026-headshots/portraits/anthony-ramos.jpg"
  },
  {
    "recordId": "recMzTDCDVD2xkeK2",
    "name": "Rahil Briggs",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "National Director, Healthy Steps, Clinical Professor",
    "organization": "HealthySteps",
    "title": "National Director, HealthySteps, a program of ZERO TO THREE",
    "bio": "Rahil D. Briggs, PsyD, is an award-winning clinical child psychologist, educator, and advocate. As National Director of HealthySteps, a program of the leading early childhood nonprofit ZERO TO THREE, she oversees one of the nation's most influential efforts to help babies, toddlers and their families thrive from the very start of life. In that role, she has scaled HealthySteps to more than 400 sites nationwide, currently reaching over half a million children and their families—and growing. Early in her career, at Montefiore Health System in the Bronx, Dr. Briggs founded one of the nation's largest integrated pediatric behavioral health programs (recognized with the 2018 Health Care Delivery Award from the Academic Pediatric Association) and continues to shape the future of children's behavioral health as a clinical professor at Albert Einstein College of Medicine. Her innovative work over the past two decades has helped redefine how health systems support young children's behavioral health and development during the most critical years of life. Dr. Briggs is the editor of Integrated Early Childhood Behavioral Health in Primary Care, published by Springer (2016) and completed her undergraduate work at Duke University, magna cum laude, and her doctoral work at New York University.",
    "hasHeadshot": true,
    "headshotBytes": 2571103,
    "headshotFile": "/2026-headshots/portraits/rahil-briggs-2-c.jpg"
  },
  {
    "recordId": "recSyYkNPi4t51OwH",
    "name": "Ray Lewis",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent",
      "4"
    ],
    "occupation": "NFL, ray of hope",
    "organization": "Ray of Hope",
    "title": "Pro Football Hall of Famer, Entrepreneur & Humanitarian",
    "bio": "Ray Lewis is a Pro Football Hall of Fame linebacker, two-time Super Bowl champion and Super Bowl XXXV Most Valuable Player. During his 17-year career with the Baltimore Ravens, he became one of the most accomplished defensive players and respected leaders in NFL history. Today, Lewis is an entrepreneur, motivational speaker, community leader and humanitarian committed to mentorship and empowering others to reach their full potential.",
    "hasHeadshot": true,
    "headshotBytes": 13583,
    "headshotFile": "/2026-headshots/portraits/ray-lewis-3.jpg"
  },
  {
    "recordId": "recaItHhATpmvxvDu",
    "name": "Steve Wozniak",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "A-Talent",
      "Co-Chair",
      "2",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder, Apple",
    "bio": "A Silicon Valley icon, technology entrepreneur and philanthropist for more than forty years, Steve Wozniak has helped shape the computing industry with his design of Apple’s first line of products the Apple I and II. He also influenced the popular Macintosh. In 1976, Wozniak and Steve Jobs founded Apple Computer Inc. with Wozniak’s Apple I personal computer.\n\nWozniak is the author of iWoz: From Computer Geek to Cult Icon (Norton Publishing), his New York Times best-selling autobiography. His television appearances include: ABC’s Dancing with the Stars, The Big Bang Theory, The Late Show with Stephen Colbert, Conan, The Tonight Show Starring Jimmy Fallon and Celebrity Watch Party.\n\nWozniak continues to pursue his entrepreneurial and philanthropic interests to this day. In October 2017, Steve co-founded Woz U — a postsecondary education and training platform focused on software engineering and technology development.\n\nDuring it all Wozniak has delivered thousands of talks and fireside chats, thrilling audiences and inspiring the next generation of entrepreneurs and engineers.",
    "hasHeadshot": true,
    "headshotBytes": 273110,
    "headshotFile": "/2026-headshots/portraits/steve-wozniak-2-c.jpg"
  },
  {
    "recordId": "recdC5AYx00UN7Vsj",
    "name": "Mike Majlak",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent",
      "Philanthropist",
      "8"
    ],
    "occupation": "Podcast host",
    "organization": "Impaulsive",
    "title": "Host, Impaulsive",
    "bio": "Mike Majlak is a bestselling author, content creator, entrepreneur, and co-host of the globally recognized Impaulsive podcast. In his memoir, The Fifth Vital, Mike candidly shares his journey through heroin addiction and recovery. Drawing from his lived experience, he uses his platform to encourage honest conversations around addiction, mental health, resilience, and the power of rebuilding one’s life.",
    "hasHeadshot": true,
    "headshotBytes": 138344,
    "headshotFile": "/2026-headshots/portraits/mike-majlak-3-c.jpg"
  },
  {
    "recordId": "recofty50gwntw8sY",
    "name": "Kevin Hines",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Mental Health Champion",
    "bio": "Kevin Hines is a storyteller, filmmaker, mental health advocate, and one of the most prominent voices of suicide prevention in the world. At 19 years old, he survived a suicide attempt off the Golden Gate Bridge, a moment that changed the course of his life forever. Since then, Kevin has dedicated himself to spreading a message of hope, healing, and resilience, reaching billions with his unshakable belief that life is worth living. He is a decorated thought leader in the mental health and suicide prevention space.\n\nToday, Kevin is a bestselling author, multi-award-winning filmmaker, and internationally renowned keynote speaker who influences global audiences through the power of story. His films, including the critically acclaimed Suicide: The Ripple Effect, Stay Alive, Continue, and the upcoming The Toll, spotlight the systemic struggles of suicide, brain pain, and mental health while championing solutions that save lives.\n\nThrough the Hinesights Podcast and his social media presence, Kevin has garnered billions of views. Through his collaborations with leaders in healthcare, technology, policy, and entertainment, he has proven that stories have the power to transform communities. His lived-experience story, groundbreaking presentations, and pioneering social media model have been both qualitatively and quantitatively peer-reviewed, demonstrating measurable impact in saving lives, increasing help-seeking behaviors, and improving outreach to crisis and text lines.\n\nHis mission is simple but profound: to remind people everywhere that pain is temporary, recovery is possible, and hope can be found even in our darkest hours.\n\nKevin’s journey is not only one of survival but of purpose. He continues to live with bipolar disorder, openly sharing both his struggles and triumphs as living proof that with help, support, and resilience, we can all find a way to be here tomorrow and every day after that.",
    "hasHeadshot": true,
    "headshotBytes": 49041,
    "headshotFile": "/2026-headshots/portraits/kevin-hines.jpg"
  },
  {
    "recordId": "rec6BVFGDrWyj743W",
    "name": "Ryan Wolfington",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Executive Producer",
      "Philanthropist"
    ],
    "occupation": "CEO, Inspiring Children Foundation",
    "organization": "Inspiring Children Foundation",
    "title": "President, Jewel Inc.; Founder, Inspiring Children Foundation; Co-Founder, Not Alone Challenge",
    "bio": "Ryan Wolfington is an accomplished entrepreneur and dedicated philanthropist, known for founding the Inspiring Children Foundation.\n\nBefore transitioning to the nonprofit sector, Ryan restructured and led businesses in the financial, gaming, and teleservices industries. His expertise led two of these companies to go public on the NASDAQ exchange. Since the early ’90s, Ryan has been a conscious capitalist, prioritizing dynamic corporate cultures and investing in human capital. His pioneering work in corporate wellness and mindfulness has set industry standards.\n\nIn 1999, Ryan founded the Inspiring Children Foundation, where he has volunteered as President of the Board for 25 years. The foundation’s programs have inspired millions online and thousands in person to achieve high performance in life. Notably, 95% of the foundation’s youth participants earn college scholarships, with 58% securing places in Ivy League-level institutions. More than 300 program alumni are currently enrolled in prestigious universities such as Stanford, Harvard, Princeton, Oxford, Yale, Georgetown, and many more.\n\nThe foundation focuses on a holistic approach to high-performance living, encompassing mentoring, sports, project-driven learning, entrepreneurial skills, and “Psychology for Life.” Ryan’s innovative strategies in restructuring companies have been applied to help children restructure their lives, with the program now being replicated in 22 cities. The foundation has been selected as the official charity of Sir Richard Branson’s Necker Cup.\n\nIn 2007, Ryan received the President of the United States Service Award for his contributions to human development. He has also collaborated with the United States Tennis Association, serving as President of USTA Nevada. As a producer, Ryan contributed to the award-winning film Bella, which won the People’s Choice Award at the Toronto International Film Festival.\n\nRyan is President of the Board of Jewel Inc., working closely with four-time Grammy-nominated singer-songwriter and New York Times bestselling author Jewel. Together, they have co-created and produced multiple projects, including Jewel’s Cirque du Soleil show, The Wellness Experience Festival, The Portal by Jewel, and the Scale Global Summit. Ryan also served as America’s first Chief Mental Health Officer for Hudson’s Bay Company, overseeing its iconic brands Saks Fifth Avenue and Saks OFF 5TH.",
    "hasHeadshot": true,
    "headshotBytes": 2069482,
    "headshotFile": "/2026-headshots/portraits/ryan-wolfington-4.jpg"
  },
  {
    "recordId": "reczg9h6dJ3Uzc2o4",
    "name": "Jewel",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Co-Chair",
      "Executive Producer",
      "A-Talent",
      "Philanthropist",
      "1"
    ],
    "occupation": "Musician",
    "organization": "Inspiring Children Foundation",
    "title": "4-Time Grammy Nominated Singer-Songwriter, Visual Artist & Mental Health Pioneer",
    "bio": "Jewel Kilcher is a multi-platinum recording artist, poet, author, and humanitarian whose voice and vision have influenced generations. Raised in the Alaskan wilderness, she turned hardship into inspiration, writing songs that reflect authenticity, vulnerability, and hope.\n\nBeyond her success as a musician, Jewel has built a legacy as a philanthropist and thought leader in mental health and emotional intelligence. Through her Inspiring Children Foundation, she has spent over two decades helping youth overcome adversity using mindfulness, mentorship, and education.",
    "hasHeadshot": true,
    "headshotBytes": 21398,
    "headshotFile": "/2026-headshots/portraits/jewel-2-c.jpg"
  },
  {
    "recordId": "recEQlvX1qbFabpY4",
    "name": "King Trot",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Street Rapper",
    "organization": "",
    "title": "Lyricist",
    "bio": "King Trot is a rapper and freestyle performer from Kansas City, Missouri, known for his quick wit, spontaneous lyrics, and engaging street performances in Las Vegas. He gained widespread attention through viral freestyle videos, including his signature “Going to Jail” refrain, turning everyday encounters into musical moments. Raised in a musical family with roots in the church, he brings humor, faith, and personal experience to his work. Beyond entertainment, King Trot aims to use his growing platform to explore social issues and build connection through music.",
    "hasHeadshot": true,
    "headshotBytes": 590813,
    "headshotFile": "/2026-headshots/portraits/king-trot-c.jpg"
  },
  {
    "recordId": "rec0vSvESPiQdltil",
    "name": "Caroline Jones",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent",
      "Philanthropist",
      "10"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter, Multi-Instrumentalist & Member of Zac Brown Band",
    "bio": "Caroline Jones is a singer-songwriter and multi-instrumentalist known for her commanding stage presence and genre-spanning musicianship. A full-time member of Zac Brown Band, she has also built a successful solo career and toured with artists including Jimmy Buffett, the Eagles, Kenny Chesney, Carrie Underwood, Tim McGraw and Faith Hill.",
    "hasHeadshot": true,
    "headshotBytes": 34760,
    "headshotFile": "/2026-headshots/portraits/caroline-jones-2-c.jpg"
  },
  {
    "recordId": "rec9ALE83duU2XwYK",
    "name": "Nick Dana",
    "status": "Confirmed Attendance",
    "groups": [
      "Philanthropist",
      "X - attendee",
      "Talent",
      "Musician"
    ],
    "occupation": "Caroline Jones Husband",
    "organization": "",
    "title": "Professional Sailor & America’s Cup Veteran",
    "bio": "Nick Dana is a professional sailor from Newport, Rhode Island, whose international career has included three editions of the Volvo Ocean Race and a role with the New York Yacht Club’s American Magic sailing team. An accomplished offshore and America’s Cup competitor, he brings extensive experience in high-performance racing, teamwork and leadership under pressure.",
    "hasHeadshot": true,
    "headshotBytes": 213661,
    "headshotFile": "/2026-headshots/portraits/nick-dana-hd-20261015.jpg"
  },
  {
    "recordId": "recw4Xqw8Y5x2uWex",
    "name": "Sarah Steil",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter",
    "bio": "Blending a country-pop heart with an R&B soul, Sarah Steil is an independent artist and songwriter based in Nashville, Tennessee. Originally from the suburbs of Chicago and rooted in her Mexican-American heritage, she creates music that combines bold storytelling, soulful melodies, and modern country influences.\n\nAfter moving to Nashville for college to pursue music, Sarah immersed herself in the city’s songwriting community, collaborating with songwriters, producers, and musicians who helped shape her genre-blending sound. In 2024, while running late to church after a session working on her upcoming release, “No More Smoke,” she met the man who would become her husband, marking a new chapter in both her life and artistry. Whether deeply personal, wildly imaginative, or inspired by life’s unexpected twists, her music is rooted in honest storytelling, soulful emotion, and the belief that every song starts with a story worth telling",
    "hasHeadshot": true,
    "headshotBytes": 8584210,
    "headshotFile": "/2026-headshots/portraits/sarah-steil-3-c.jpg"
  },
  {
    "recordId": "recbeWStw87AVilsf",
    "name": "Mario Martinez",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Profesional Baseball Player",
    "organization": "",
    "title": "Manager, Producer & Entrepreneur",
    "bio": "Mario Martinez is a manager, producer, and entrepreneur whose work spans entertainment, business, and hospitality. As a business and restaurant owner, Mario brings the same passion for people, community, and culture to his entrepreneurial ventures that he brings to his work in entertainment. As a producer, he is passionate about bringing real stories and authentic Latino cultural experiences to life, creating space for voices and stories that deserve to be seen and heard.",
    "hasHeadshot": true,
    "headshotBytes": 595571,
    "headshotFile": "/2026-headshots/portraits/mario-martinez-c.jpg"
  },
  {
    "recordId": "recO90baad0WBjFDG",
    "name": "Harry Hudson",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "Musician",
    "organization": "Hey, I'm Here For You",
    "title": "Singer-Songwriter",
    "bio": "Raised in Los Angeles, Hudson pursued music from a young age, releasing his first singles in 2013. At age 20, he was diagnosed with Stage 3 Hodgkin’s lymphoma, an experience that profoundly shaped his artistry. Following his recovery, Hudson signed with Roc Nation and released his debut album Yesterday’s Tomorrow Night in 2018, featuring the breakout single “Yellow Lights,” which reached Spotify’s U.S. Viral Top 10. His sophomore project, (Hey, I’m Here For You), further established his reputation for writing emotionally honest songs about love, grief, and resilience.\n\nBeyond music, Hudson is an advocate for mental health and young cancer patients. He co-founded the nonprofit Hey, I’m Here For You, and partners with Teen Cancer America to create safe, creative spaces for teens in treatment. His personal story of loss, survival, and perseverance fuels both his music and his mission to use art as a tool for healing and connection.",
    "hasHeadshot": true,
    "headshotBytes": 101246,
    "headshotFile": "/2026-headshots/airtable-current/recO90baad0WBjFDG.jpg"
  },
  {
    "recordId": "reclYeG4KSjgKu6Rx",
    "name": "Lexi Hensler",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "Influencer, Hugz Founder",
    "organization": "Hugz",
    "title": "Social Media Personality & Mental Health Advocate",
    "bio": "Lexi Hensler is a content creator, mental health advocate, and co-founder of Hugz, a wellness brand built around weighted stuffed animals designed to ease anxiety and help people feel grounded and comforted.\n\nHugz began with something Lexi lived through herself. After a stretch of severe panic attacks, she went looking for anything that could calm her body and quiet her mind, and found that gentle weight and the feeling of being held made a real difference. That was the start of Hugz, but from early on she knew she wanted it to outgrow her own story and reach anyone who has ever felt like they were carrying it all alone.\n\nLexi has spent more than ten years talking openly about mental health online, long before it became the conversation it is today. That honesty built her platform and it's what powers Hugz now. What began as one person's search for relief is becoming a real community, a louder conversation about mental health, and the conviction that comfort should be something everyone can reach for and hold onto.",
    "hasHeadshot": true,
    "headshotBytes": 1475555,
    "headshotFile": "/2026-headshots/portraits/lexi-hensler-3.jpg"
  },
  {
    "recordId": "recz63RWWXOVmD10C",
    "name": "Jon Hershfield",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "OCD Expert",
    "organization": "",
    "title": "Director, Center for OCD and Anxiety at Sheppard Pratt",
    "bio": "Jon Hershfield, MFT is the director of the Center for OCD and Anxiety at Sheppard Pratt in Towson, Maryland, where he specializes in the treatment of obsessive-compulsive disorder (OCD) and related disorders in both outpatient and residential settings. He is the author of Being a Parent With OCD, When a Family Member Has OCD, Overcoming Harm OCD, and The OCD Workbook for Teens, and co-author of Everyday Mindfulness for OCD, The Mindfulness Workbook for OCD, and The Unwanted Thoughts and Intense Emotions Workbook. Jon is a member of the Scientific and Clinical Advisory Board of the International OCD Foundation and a faculty member of their Behavioral Therapy Training Institute. He is internationally recognized as a thought leader in the treatment of OCD and anxiety, in particular on the role of mindfulness and self-compassion in exposure-based therapy. He frequently presents at professional conferences and has been featured multiple times on CNN and other media outlets to offer his input on mental health issues.",
    "hasHeadshot": true,
    "headshotBytes": 79965,
    "headshotFile": "/2026-headshots/portraits/jon-hershfield-2.jpg"
  },
  {
    "recordId": "recis3OFj5IM80TL2",
    "name": "Morgan Marler",
    "status": "Withdrew",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Young Futures Foundation",
    "organization": "Young Futures",
    "title": "Associate Director of Network and Partnerships",
    "bio": "Morgan Marler serves as the Associate Director of Network and Partnerships at the Foundation for Social Connection. With a decade of professional experience, Morgan has dedicated her career to creating spaces and systems that promote inclusion and belonging. She has worked in education, policy, advocacy, and non-profit sectors across the United States as well as Nicaragua and South America.\n\nIn her previous role as Director of Stakeholder Engagement at CityBridge Education in Washington, D.C., Morgan successfully developed and launched strategies that engaged and strengthened the DC education ecosystem while also cultivating key relationships with stakeholders. She has led organization-wide diversity, equity, inclusion, and belonging strategies. Morgan holds a Master of Education in Education Policy from the University of Washington and a Bachelor of Arts in Humanities for Teaching and Political Science from Seattle University. She has also pursued certifications and foundational courses in racial equity, conscious leadership, somatic experience, and data analytics.",
    "hasHeadshot": true,
    "headshotBytes": 16430,
    "headshotFile": "/2026-headshots/portraits/morgan-marler.jpg"
  },
  {
    "recordId": "rec6p1vZ0YDAc1NYC",
    "name": "Ben Maxwell",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "UCSD Child and Adolescent psychiatry",
    "organization": "",
    "title": "Child & Adolescent Psychiatry Division Chief, UC San Diego & Rady Children's Hospital",
    "bio": "Dr. Ben Maxwell is a board-certified Child and Adolescent Psychiatrist and globally recognized leader on strategies aimed at improving the mental health of kids. Dr. Maxwell received his medical degree from University of Texas Health Science Center in Houston. He then completed General Psychiatry residency at University of California – Irvine followed by a fellowship in Child and Adolescent Psychiatry at University of California – San Diego and Rady Children’s Hospital. After completing the fellowship, he stayed on as faculty in San Diego where he has served in various clinical and leadership roles. Currently, Dr. Maxwell directs the Division of Child and Adolescent Psychiatry based at Rady Children’s Hospital. In this role, Dr. Maxwell has led the division to become a leader in innovation and system of care improvement, transforming the way pediatric mental health care is provided.\n\nDr. Maxwell has served in a variety of international roles to implement innovative strategies at dealing with the global mental health crisis we are seeing in kids, including training preschool teachers in Africa in early recognition of behavioral health challenges, educational programs for primary care physicians in Jordan to improve their expertise in behavioral health, and mentoring psychiatrists in Saudi Arabia to integrate behavioral health services in primary care settings.\n\nDr. Maxwell leverages expertise and knowledge not only in medicine and neuroscience, but also evolutionary psychology, cross-cultural anthropology, and behavioral economics to bring a focus to the importance of social connection, cultivation of resilience and intrinsic motivation in a world where these are becoming harder to find.\n\nOutside of these professional activities, you can find Dr. Maxwell spending time with his amazing wife and inspiring daughter or spending time enjoying the outdoors in and around San Diego.",
    "hasHeadshot": true,
    "headshotBytes": 121086,
    "headshotFile": "/2026-headshots/portraits/ben-maxwell-c.jpg"
  },
  {
    "recordId": "receSWnJ8DYQS1FLC",
    "name": "Nick Kislinger",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist",
      "D - talent"
    ],
    "occupation": "Executive Director",
    "organization": "Flourish Trust",
    "title": "Executive Director, Flourish Trust",
    "bio": "As Executive Director of Flourish Trust, Nick Kislinger brings deep expertise in coalition-building and community organizing to advance accessible, effective approaches to healing people and planet. From 2009-2011 he served as Chief of Staff to California’s Secretary of Education under Governor Schwarzenegger, overseeing California’s first Guidelines for Digital Education and managing the state’s Race to the Top strategy. Leaving Sacramento, he spent nearly a decade in social impact, starting by co-founding Impact Hub Los Angeles, where he raised $500,000 and built a community of 1,000 social impact entrepreneurs. At the Entertainment Industry Foundation, he distributed $5 million in grants and raised $34 million for the University of California’s Promise Campaign. Nick’s mental health advocacy emerged from personal experience—diagnosed with ADHD as a young adult, he discovered breathwork as an alternative to medication. In 2019, he launched Breathwrk (later acquired by Peloton), driving over 100 million downloads, which motivated him to pursue a Master’s in Clinical Psychology. At Flourish Trust, Nick advances new approaches to mental health care—including psychedelic-assisted therapy—guided by his belief that when you bring the right people together around shared purpose, remarkable things become possible.",
    "hasHeadshot": true,
    "headshotBytes": 79469,
    "headshotFile": "/2026-headshots/portraits/nick-kislinger-hd-20261015.jpg"
  },
  {
    "recordId": "recn3ZN7kRit84ZNb",
    "name": "Sanem (Sam) Alkan",
    "status": "Confirmed Attendance",
    "groups": [
      "Philanthropist",
      "F - talent"
    ],
    "occupation": "Senior Impact Officer",
    "organization": "Resonance Philanthropies",
    "title": "Senior Impact Officer",
    "bio": "Sanem “Sam” Alkan is a strategic advisor specializing in philanthropic impact, family offices, and sustainable development. She serves as Senior Impact Officer to Sheri Sobrato, focused on funding ventures in youth mental wellness, rare pediatric disease care, and high‑impact media.",
    "hasHeadshot": true,
    "headshotBytes": 115145,
    "headshotFile": "/2026-headshots/airtable-current/recn3ZN7kRit84ZNb.jpg"
  },
  {
    "recordId": "recPp9jZG87QlNaSX",
    "name": "Daniel Gillison",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "C - talent"
    ],
    "occupation": "CEO",
    "organization": "NAMI",
    "title": "CEO, NAMI",
    "bio": "Daniel H. Gillison Jr. is chief executive officer of the National Alliance on Mental Illness (NAMI), the nation’s largest grassroots mental health organization. Known for his clarity, compassion, and conviction, Gillison is a national leader working to make mental health more visible, more accessible, and more understood.\n\nSince stepping into the role in 2020, Gillison has helped guide NAMI through a period of tremendous growth and relevance—expanding HelpLine services to include texting, launching the organization’s first youth advisory group, and overseeing the release of You Are Not Alone: The NAMI Guide to Navigating Mental Health and You Are Not Alone for Parents and Caregivers: The NAMI Guide to Navigating Your Child’s Mental Health. Both books have been widely embraced for their storytelling and guidance rooted in lived experience. He also founded the CEO Alliance for Mental Health, which brings together the heads of leading organizations to align on priorities and push for smarter, more person-centered systems of care.\n\nGillison is the host of Hope Starts With Us, NAMI’s flagship podcast—now ranked in the top 25% of all shows on Buzzsprout. Whether through the podcast, his keynote speeches, or his writing, he is known for connecting deeply with people and centering lived experience in the conversation. At events across the country, it’s not unusual to see a line of attendees waiting to speak with him—offering stories, gratitude, and ideas. His leadership isn’t just strategic—it’s personal.\n\nBefore joining NAMI, Gillison served as executive director of the American Psychiatric Association Foundation and held senior leadership roles at the National Association of Counties, Xerox, Nextel, and Sprint. He currently serves on advisory boards for the National Institutes of Health, Lululemon, and the National Health Council.\n\nA proud native of Washington, D.C., Gillison holds a B.A. from Southern University and A&M College and has completed executive education at Harvard and the University of Richmond. He lives in Virginia with his wife and stays closely connected to his now-grown children.",
    "hasHeadshot": true,
    "headshotBytes": 3407030,
    "headshotFile": "/2026-headshots/portraits/daniel-gillison.jpg"
  },
  {
    "recordId": "recucSNZ7uYgU2BL9",
    "name": "Wendy Oliver-Pyatt",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "Eating Disorders",
    "organization": "Within Health",
    "title": "Co-Founder, Within Health",
    "bio": "Dr. Wendy Oliver-Pyatt is an internationally recognized psychiatrist, author, educator, and leading voice in eating-disorder treatment, mental health, weight stigma, and the harms of diet culture. For more than 25 years, she has challenged conventional thinking and translated emerging science into compassionate, human-centered care.\n\nShe is the founder and CEO of Within Health, Galen Hope, and the Eating Disorder Education Institute. Across five distinctive treatment programs, Dr. Oliver-Pyatt has pioneered integrated approaches grounded in the biopsychosocial model, intensive psychotherapy, behavioral principles, family and community involvement, and rigorous medical and psychiatric care. Her work looks beyond symptoms to understand the biological, psychological, relational, and cultural forces that place people at risk—helping individuals move toward lasting healing, greater freedom, and a more peaceful relationship with themselves.\n\nDr. Oliver-Pyatt completed her specialty training at New York University–Bellevue Hospital and has held faculty appointments at NYU, Albert Einstein College of Medicine, and the University of Nevada School of Medicine. She is board-certified by the American Board of Psychiatry and Neurology in both adult and addiction psychiatry, a Fellow of the Academy for Eating Disorders, and an EDEI Eating Disorder Credentialed Specialist Supervising Consultant.\n\nShe is the author of two books, including Questions and Answers on Binge Eating Disorder: A Guide for Clinicians, and has received Senatorial Recognition for her contributions to the mental health treatment community. She also founded Weight Stigma Awareness Week, reflecting her longstanding commitment to confronting weight-based discrimination and creating a culture in which people of all sizes can receive respectful, evidence-informed care.\n\nAs a speaker, Dr. Oliver-Pyatt brings together clinical authority, visionary leadership, personal warmth, and an unwavering belief in what becomes possible when knowledge is joined with humanity. Her presentations invite audiences not only to reconsider how we understand and treat eating disorders, but also to become active participants in building a more compassionate and effective system of care.",
    "hasHeadshot": true,
    "headshotBytes": 64634,
    "headshotFile": "/2026-headshots/portraits/wendy-oliver-pyatt-2.jpg"
  },
  {
    "recordId": "rect0ek98fHdiivP4",
    "name": "Brandon Saho",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "Sports Reporter, Mental Game Podcast",
    "organization": "",
    "title": "Founder, The Mental Game",
    "bio": "Brandon Saho is a nationally recognized mental health advocate, speaker, and founder of The Mental Game, inspired by his own battle with suicide. Saho's vulnerable storytelling and viral mental health videos have helped millions around the world.\n\n\"People respond to his heart\" is how Oprah described the life-changing impact of his work. Saho's mental health journey has been featured by Forbes, The Oprah Podcast, CBS News, and more.\n\nThe Mental Game podcast has become a safe space for the biggest stars to share their emotional stories, including actor Terry Crews, Dodgers star Max Muncy, The Office’s Kate Flannery, Robin Williams’ son Zak, and many more. The goal? Save lives one conversation at a time.\n\nSince 2024, he’s helped more than 300,000 people across 47 states open up through real, vulnerable, life-changing conversations at schools, workplaces, conferences, and events.\n\nFor more on Brandon’s story and The Mental Game, visit themental.game.",
    "hasHeadshot": true,
    "headshotBytes": 3884561,
    "headshotFile": "/2026-headshots/portraits/brandon-saho.jpg"
  },
  {
    "recordId": "recs3sOrFxD1pBYwS",
    "name": "Michael Townsend",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Tape Art",
    "organization": "Tape Art",
    "title": "Tape Art Founder",
    "bio": "Michael Townsend is the founder of the Tape Art movement and the world's first practicing tape artist. Since 1989 he has created over 500 large-scale temporary murals on walls across the globe using only low-adhesive tape, collaborating with over 60,000 students and community members along the way. He is one of the artists behind the award-winning Netflix documentary Secret Mall Apartment and has worked with organizations ranging from General Electric to schools, healing centers, and correctional facilities. His work sits at the intersection of art, community, and human connection.",
    "hasHeadshot": true,
    "headshotBytes": 2298145,
    "headshotFile": "/2026-headshots/portraits/michael-townsend-hd-20261015.jpg"
  },
  {
    "recordId": "recSzvMUSB1SKmzEG",
    "name": "Leah Smith",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Tape Art",
    "organization": "Tape Art",
    "title": "Tape Art Leader",
    "bio": "Leah Smith is a co-leader of the Tape Art movement, which she helped pioneer alongside Michael Townsend in Providence, Rhode Island in 1989. For over three decades she has traveled the world creating large-scale collaborative tape murals in cities, schools, corporations, and healing centers, bringing communities together through the shared experience of making art. From Hong Kong to Germany to Greece, Leah and Michael have brought the transformative power of tape art to thousands of people and spaces around the world.",
    "hasHeadshot": true,
    "headshotBytes": 99411,
    "headshotFile": "/2026-headshots/portraits/leah-smith-hd-20261015.jpg"
  },
  {
    "recordId": "recAFWCu2FbuD5qju",
    "name": "Margaret Hines",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "CEO, Kevin and Margaret Hines Foundation",
    "bio": "Margaret is a behavioral health champion, serial builder, impact investor and multi-award winning executive producer. Most recently, she co-founded Navi, a digital youth mental health platform with Dr. Jessica Schleider & Julia Belt. She is also co-founder of the multi-award winning film production company, 17th & Montgomery Productions.\n\nAs an impact investor with a 15+ year background in private equity and venture capital she has a significant focus on driving capital into the behavioral healthcare space and closing the funding gap for women-led ventures at the early and growth stages.\n\nShe has served on the boards of the American Association of Suicidology, the Suicide Prevention Resource Center, Crisis Text Line and the U.S. Department of Defense’s Lived Experience Advisory Committee. She currently sits on board of Half the Story, a digital wellbeing program pioneering the way for Gen Z’ers.",
    "hasHeadshot": true,
    "headshotBytes": 60135,
    "headshotFile": "/2026-headshots/portraits/margaret-hines.jpg"
  },
  {
    "recordId": "reciWogzEuzwOIQJW",
    "name": "Caroline Silby",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "Head of Sport Psychology & Mental Health Services, US Figure Skating",
    "organization": "",
    "title": "Head of Sport Psychology & Mental Health, U.S. Figure Skating",
    "bio": "Caroline Silby, Ph.D., CMPC, is Head of Sport Psychology and Mental Health Services for U.S. Figure Skating, 2023 USOPC Service Provider of the Year, Mental Performance Provider for the 2026, 2022, and 2018 Olympic Figure Skating Teams and the 2026, 2025, 2024, and 2023 World Championships Teams, and was inducted into the Professional Skaters Association Hall of Fame in 2025. She has worked on an individual basis with 20 Olympic Gold Medalists, two Paralympian Gold Medalists, numerous Olympians, World Champions and Medalists, as well as hundreds of National Team members, Division I student-athletes, teams, and coaches. She has had clients from a broad range of sports including the MLS, WTA, WPSL, NFL, NHL, NBA, MLB, fly-fishing, muay thai, cycling, pro sports car racing, go-kart racing, chess, ski & snowboard, ski jumping, fencing, tae kwon do, climbing, triathlon, track & field, strongman, pole vaulting, equestrian, gymnastics, softball, baseball, lacrosse, field hockey, swimming, water polo, synchronized skating, figure skating, and golf. As an elite athlete herself, Dr. Silby was a member of the U.S. Figure Skating National Team.\n\nDr. Silby holds a Doctorate in Sports Psychology from the University of Virginia and is a Certified Mental Performance Consultant through the Association of Applied Sport Psychology. She is the author of Games Girls Play: Understanding and Guiding Young Female Athletes (St. Martin's Press, 2000, 2001), and a contributor to the American Girl series Smart Girls Guide: Sports and Fitness (American Girl, 2018), Sports Secrets and Spirit Stuff (American Girl, 2006), The Young Female Athlete (Springer Publishing, 2016), The Science of Figure Skating (Routledge, 2021), and The Transition Playbook for Athletes (2019). She served as adjunct faculty at American University for 12 years.\n\nFormerly, she was President of the Board of the Southwest Women's Law Center and served on the advisory board for FabLab, a Fox television series, and Stronger Than You Think, a three-day mental health national livestream with 60 celebrities and athletes. She has been a mental health curriculum creator for Winning Play$, a financial literacy program, and has been a featured speaker for the State Department's Sports United program. She serves on the Medical Advisory Board for American Ballet Theatre. Silby is a sought-after expert and has appeared on radio and television programs including the Oprah Winfrey Show. She resides in Potomac, Maryland, with her husband Laurence Hinz and their daughters, Maddie and Carly.",
    "hasHeadshot": true,
    "headshotBytes": 128715,
    "headshotFile": "/2026-headshots/airtable-current/reciWogzEuzwOIQJW.jpg"
  },
  {
    "recordId": "recb4o2QcOxRaZ0aA",
    "name": "Jessica Edwards",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "CDO of NAMI",
    "organization": "NAMI",
    "title": "CDO, NAMI",
    "bio": "Jessica Edwards directs the strategy, direction and organizational effort for all philanthropic fundraising efforts that support NAMI’s mission and strategic plan. She identifies and encourages fundraising opportunities and engages in meaningful donor and funder relationships. She oversees strategic partnerships that touch all corners of the organization and alliance. Jessica also oversees field fundraising efforts, including the NAMIWalks program.\n\nJessica joined NAMI in 2011 as a coordinator of corporate affairs and governance. Since then, she has worked her way up in the organization overseeing the corporate, foundation and strategic partnership areas of Strategic Alliances & Development. She holds an undergraduate degree in Public Relations from West Virginia University and a Master’s Degree in Public Relations and Corporate Communications from Georgetown University.",
    "hasHeadshot": true,
    "headshotBytes": 1882910,
    "headshotFile": "/2026-headshots/portraits/jessica-edwards.jpg"
  },
  {
    "recordId": "recG9o9dmIx9JxuB2",
    "name": "Marc Brackett",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "psychologist",
    "organization": "",
    "title": "Founding Director, Yale Center for Emotional Intelligence",
    "bio": "Marc A. Brackett, PhD, is a prominent psychologist, educator, and author, best known as the founding director of the Yale Center for Emotional Intelligence and a professor in Yale’s Child Study Center. Growing up in New Jersey, his own experiences with emotional struggle and trauma shaped his lifelong mission to help individuals and institutions harness emotional awareness and regulation. He developed RULER, an SEL framework that has reached thousands of schools globally, and has authored Permission to Feel and Dealing With Feeling.",
    "hasHeadshot": true,
    "headshotBytes": 22263,
    "headshotFile": "/2026-headshots/portraits/marc-brackett-2.jpg"
  },
  {
    "recordId": "recvspdVLJQposUyX",
    "name": "Ellie Kanner",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "Film Director",
    "organization": "",
    "title": "Film & Television Director",
    "bio": "Ellie Kanner is a film and television director, producer and former casting director. Her casting credits include the original pilots of Friends, Sex and the City, The Drew Carey Show and Sabrina the Teenage Witch. She later transitioned into directing, working across film and television on projects including Boston Legal, Greek and The Dead Zone.",
    "hasHeadshot": true,
    "headshotBytes": 42150,
    "headshotFile": "/2026-headshots/portraits/ellie-kanner-2-c.jpg"
  },
  {
    "recordId": "recei8qxO98rmafrn",
    "name": "Trent Alenik",
    "status": "Confirmed Attendance",
    "groups": [
      "Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "CEO, Inspiring Children Foundation",
    "bio": "Trent Alenik was the second student to take part in the Inspiring Children Foundation. At just 14 years of age, he joined the organization to transform his life. Trent earned a scholarship to play college tennis at Villanova University where he went on to study finance at their top ranked undergraduate business school, and worked on Wall Street during college at Merrill Lynch and Barclays Capital.\n\nUpon graduating in 2011, Trent turned down offers to work in Finance and came back to Las Vegas where he took a job working with the Inspiring Children Foundation. Over 12 years he progressed from a volunteer to manager to Executive Director and now serving as CEO where he oversees all day to day operations, fundraising, programming and events. During his tenure he has 10x’d the organization’s budget 100x’d the Foundation’s impact through ICF’s online mental health platforms and in-person wellness festivals.\n\nTrent serves on the board of USTA Nevada, is Vice President of the USTA Intermountain, and chairs a USTA National committee. Trent was recently honored with Vegas’ 40 under 40 for the class of 2023. Trent received the esteemed NO QUIT & Rudy Awards in high school, along with the Innovative Creative Excellence Award from the Villanova School of Business.",
    "hasHeadshot": true,
    "headshotBytes": 28504,
    "headshotFile": "/2026-headshots/portraits/trent-alenik-2-c.jpg"
  },
  {
    "recordId": "recOpXQPJ5XJgdnTI",
    "name": "Jan Thwaites",
    "status": "Confirmed Attendance",
    "groups": [
      "Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Dreams",
    "title": "Co-Founder & COO, Inspiring Dreams",
    "bio": "Jan Thwaites is the co-founder and Chief Operating Officer of Inspiring Dreams, bringing more than 25 years of experience in events, luxury hospitality, and corporate travel. Based in North Carolina, he helps create exclusive sports and travel experiences through a company whose work supports the Inspiring Children Foundation. As a producer of the Not Alone Summit, Jan brings his event expertise to an initiative that unites leaders, artists, and advocates to normalize mental health conversations and build a more connected community of support.",
    "hasHeadshot": true,
    "headshotBytes": 116788,
    "headshotFile": "/2026-headshots/portraits/jan-thwaites-2.jpg"
  },
  {
    "recordId": "recWoSi9OsvBSRRcu",
    "name": "Sally Dewhurst",
    "status": "Confirmed Attendance",
    "groups": [
      "Producer"
    ],
    "occupation": "",
    "organization": "UKNY",
    "title": "Executive Producer, Not Alone Summit & Event Producer",
    "bio": "Sally Dewhurst is a Las Vegas–based entertainment and event producer and Executive Producer of the Not Alone Summit. Through her work with UKNY Productions, she brings experience in live entertainment, event planning, and philanthropic experiences. Her credits include serving as project advisor for Cirque du Soleil’s One Night for One Drop, a benefit supporting access to safe water. UKNY Productions, One Drop",
    "hasHeadshot": true,
    "headshotBytes": 464971,
    "headshotFile": "/2026-headshots/portraits/sally-dewhurst-2.jpg"
  },
  {
    "recordId": "recozLJEYuvGPdIkH",
    "name": "Sophie Novak",
    "status": "Confirmed Attendance",
    "groups": [
      "Producer"
    ],
    "occupation": "",
    "organization": "UKNY",
    "title": "Executive Producer, Not Alone Summit",
    "bio": "At the Not Alone Summit, Sally brings that production experience to an event uniting artists, advocates, and mental health leaders through storytelling, music, and meaningful conversation.",
    "hasHeadshot": true,
    "headshotBytes": 452749,
    "headshotFile": "/2026-headshots/portraits/sophie-novak-2-c.jpg"
  },
  {
    "recordId": "recVmdW9MKkXrKASS",
    "name": "Trevor Short",
    "status": "Confirmed Attendance",
    "groups": [
      "Producer",
      "X - attendee",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "Inspiring Dreams",
    "title": "Founder & CEO, Inspiring Dreams",
    "bio": "Trevor Short is a tennis entrepreneur and event producer from Murfreesboro, Tennessee. A former nationally ranked junior and NCAA Division I player at Middle Tennessee State University, he went on to produce professional tennis events featuring Andy Roddick, John Isner, and the Bryan Brothers. He also co-founded the Necker Cup, bringing tennis professionals and amateurs together on Sir Richard Branson’s Necker Island. National Tennis Foundation, Inspiring Children Foundation",
    "hasHeadshot": true,
    "headshotBytes": 635493,
    "headshotFile": "/2026-headshots/portraits/trevor-short-3-c.jpg"
  },
  {
    "recordId": "recqhLGSO9v58a470",
    "name": "Clark Cummings",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Dreams",
    "title": "Partner & Business Development Officer, Inspiring Dreams",
    "bio": "As founder and CEO of Inspiring Dreams, Trevor creates sports and entertainment experiences that help fund the Inspiring Children Foundation, connecting his lifelong passion for tennis with opportunities to support young people through education, mentorship, and mental health programs. Inspiring Dreams",
    "hasHeadshot": true,
    "headshotBytes": 570136,
    "headshotFile": "/2026-headshots/portraits/clark-cummings-2-c.jpg"
  },
  {
    "recordId": "rec2E5AC6Qf3kwzBf",
    "name": "Aphrah Brokaw",
    "status": "Confirmed Attendance",
    "groups": [
      "Executive Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "COO, Jewel Inc.",
    "bio": "Aphrah Brokaw is the Chief Operating Officer of Jewel Inc., co-manager of singer-songwriter Jewel, and an Executive Producer of the Not Alone Summit. An alumna of the Inspiring Children Foundation, she earned a scholarship to Villanova University’s School of Business, where she also competed on the varsity tennis team.\n\nDrawing on her own experiences with anxiety, loss, and personal growth, Aphrah brings a deeply personal connection to her work in mental health. She credits the foundation’s mentorship, community, and mindfulness tools with helping her build the confidence and resilience that now inform her leadership.",
    "hasHeadshot": true,
    "headshotBytes": 225173,
    "headshotFile": "/2026-headshots/portraits/aphrah-brokaw-2-c.jpg"
  },
  {
    "recordId": "recelSNFTcKBG5jHu",
    "name": "Paige Neuenschwander",
    "status": "Confirmed Attendance",
    "groups": [
      "Co-Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "Executive Assistant to Ryan Wolfington & Not Alone Producer",
    "bio": "Paige Neuenschwander is a Las Vegas–based member of the Inspiring Children Foundation team, serving as Executive Assistant and a producer of the Not Alone Summit. Her work supports the foundation’s mission to help young people build physical, emotional, and mental well-being through education, mentorship, and community. At the Summit, Paige helps bring together artists, advocates, and mental health leaders for conversations and experiences that encourage connection and reduce stigma around mental health.",
    "hasHeadshot": true,
    "headshotBytes": 216817,
    "headshotFile": "/2026-headshots/portraits/paige-neuenschwander.jpg"
  },
  {
    "recordId": "recarnqgsNyehnKZo",
    "name": "Paul Dalio",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "",
    "organization": "Dalio Philanthropies",
    "title": "Writer, Director & Composer",
    "bio": "Paul Dalio is a writer, director and composer whose work explores mental health through film, music and storytelling. His feature-film debut, Touched with Fire, was inspired by his experience living with bipolar disorder and received recognition from numerous mental-health organizations. Paul is also an advocate, educator and author who uses his creative work to challenge stigma and illuminate the complexity of mental illness.",
    "hasHeadshot": true,
    "headshotBytes": 158167,
    "headshotFile": "/2026-headshots/portraits/paul-dalio-2-c.jpg"
  },
  {
    "recordId": "recQKZYqH5TdCKP4a",
    "name": "Noah Springer",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder, Pickle Pro Labs",
    "bio": "A former professionally ranked tennis player, Noah Springer has completed studies at the National Personal Training Institute in Waltham, Massachusetts. He received certification as a personal trainer from the National Academy of Sports Medicine upon fulfilling 200 hours of instruction in nutrition and conducting 200 hours of fitness training. Committed to health and fitness, Noah Springer adheres to a vegetarian diet and engages in a variety of athletic activities, including weight lifting, skiing, and running in road and trail races.\n\nActive in youth development within the Grafton, Massachusetts, community, Noah Springer has served as a den leader for the local Boy Scouts troop. He has also given his time as a coach for his son’s T-ball and soccer teams. Every Tuesday and Thursday morning, Mr. Springer volunteers at Millbury Street Elementary School to teach the before-school exercise and nutrition program BOKS (Build Our Kids’ Success).\n\nExperienced in diverse fields, Noah Springer worked for two years as a licensed realtor for Keller Williams before attending Kaplan University and graduating summa cum laude with a BS in psychology. He enjoys spending his free time playing guitar, listening to music, and traveling with his family.",
    "hasHeadshot": true,
    "headshotBytes": 160737,
    "headshotFile": "/2026-headshots/portraits/noah-springer.jpg"
  },
  {
    "recordId": "recLyBiEsfHVQ4kmT",
    "name": "Melinda Springer",
    "status": "Withdrew",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder, Pickle Pro Labs and Philanthropist",
    "bio": "Melinda Springer is a philanthropist and co-founder of Pickle Pro Labs. Alongside her husband, Noah, she supports organizations and experiences centered on mental health, wellness and meaningful community connection. She is also passionate about the role movement and shared activities can play in strengthening relationships and supporting emotional well-being.",
    "hasHeadshot": true,
    "headshotBytes": 35507,
    "headshotFile": "/2026-headshots/portraits/melinda-springer.jpg"
  },
  {
    "recordId": "recv6l5ECpQWgwSkU",
    "name": "Cameron Kelly",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Philanthropist; Director, Salehi Family Foundation; Founder, CSKblooms",
    "bio": "Cameron Salehi Kelly is a Midland, Texas–based philanthropist, entrepreneur and community advocate. A graduate of Southern Methodist University, she previously coordinated international photography expeditions with National Geographic and later founded CSKblooms. Cameron has helped raise nearly $30 million for organizations in the Midland community and has supported causes spanning education, healthcare, children and families, food insecurity, wildlife conservation, and Alzheimer’s awareness. She serves as a director of the Salehi Family Foundation.",
    "hasHeadshot": true,
    "headshotBytes": 272488,
    "headshotFile": "/2026-headshots/airtable-current/recv6l5ECpQWgwSkU.jpg"
  },
  {
    "recordId": "recCHrGzdNbQkV22m",
    "name": "Winston Kelly",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Energy Executive & Philanthropist; Director, WK Energy & Salehi Family Foundation",
    "bio": "Winston Kelly is a Midland, Texas–based energy executive and philanthropist. He serves as a director of WK Energy and the Salehi Family Foundation, which supports education, human services and community-focused charitable initiatives. Alongside his wife, Cameron, Winston is involved in philanthropic efforts benefiting communities in Texas and beyond",
    "hasHeadshot": true,
    "headshotBytes": 279036,
    "headshotFile": "/2026-headshots/airtable-current/recCHrGzdNbQkV22m.jpg"
  },
  {
    "recordId": "rec1pF4n6IP9CL77n",
    "name": "Karena Dawn",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "Fitness",
    "organization": "The Big Silence",
    "title": "CEO & Co-Founder, Tone It Up; Founder, The Big Silence",
    "bio": "Karena Dawn is the founder and CEO of Tone It Up, the fitness and wellness community she started in 2009 to help women feel strong, supported and connected. Her story has been featured in Forbes, Entrepreneur, and Create & Cultivate named her to its C&C 100 list for health and wellness. In 2025, she bought the company back to become its sole owner.\n\nKarena is also the founder of The Big Silence, a foundation dedicated to breaking the silence around mental health, and host of The Big Silence podcast, where she has honest conversations about healing, hope, mental health, and the things we don't always say out loud. She is also a NAMI Ambassador to continue to end the stigma. A New York Times bestselling author of three books, including her memoir, ‘The Big Silence’, she is also a certified trainer and nutrition coach, a meditation teacher trained at the Chopra Center, and a keynote speaker.\n\nAt the Not Alone Summit, Karena will lead a Tone It Up workout and record live episodes of The Big Silence podcast.",
    "hasHeadshot": true,
    "headshotBytes": 28598252,
    "headshotFile": "/2026-headshots/airtable-current/rec1pF4n6IP9CL77n.jpg"
  },
  {
    "recordId": "receXlSPuLrmW4ySi",
    "name": "Mike Posner",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Grammy-Nominated Singer-Songwriter, Speaker & Adventurer",
    "bio": "Mike Posner is a Detroit-born singer-songwriter known for hits including “Cooler Than Me” and “I Took a Pill in Ibiza,” which earned a Grammy nomination for Song of the Year. Beyond music, he completed a walk across America in 2019 and summited Mount Everest in 2021. Through his music, speaking, and extraordinary personal challenges, Mike shares lessons in resilience, self-discovery, and finding purpose, encouraging others to embrace growth and live more intentionally.",
    "hasHeadshot": true,
    "headshotBytes": 229876,
    "headshotFile": "/2026-headshots/portraits/mike-posner-c.jpg"
  },
  {
    "recordId": "recOn7WM2qtMys0YZ",
    "name": "Alana Springsteen",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter",
    "bio": "A fearless storyteller with an unshakable sense of self, Alana Springsteen has built her career on telling the truth, no matter how messy or hard-fought. Across high-concept projects like her three-part debut album TWENTY SOMETHING and brand new sophomore LP I HOPE THIS HELPS (a boldly autobiographical body of work), the 26-year-old artist/songwriter has carved out a vital space for raw catharsis and unfiltered reflection. A multi-instrumentalist with uncompromising vision, Springsteen plays guitar and piano throughout her albums and co-produces all her material, shaping each song with a hands-on precision that underscores her identity as both author and architect. Rooted in Country but unbound by its edges, she pulls freely from Alt-Pop and beyond, building a sonic world as expansive as it is emotionally exacting. Born and raised in Pungo, Virginia (a one-of-a-kind region where farmland meets beach), Springsteen’s connection to music began in church, where she first found her voice as a child. By age seven, she was teaching herself to play guitar and writing her own songs; at ten, she began traveling to Nashville for co-writing sessions with industry heavyweights. After making her landmark debut with TWENTY SOMETHING — a 2023 release featuring her GOLD-certified smash “goodbye looks good on you (feat. Mitchell Tenpenny)” — Springsteen earned massive praise from the likes of NPR (“Few artists dissect and make sense of life in your 20s quite like Alana Springsteen”) and PEOPLE (“Everything about her says she was made for this wild, breathless — and, yes, high-risk — life of an artist”). A powerhouse live performer who commands rooms of any size, she just wrapped her second headlining tour the I HOPE THIS HELPS TOUR this fall; she’s performed at major festivals like Stagecoach; toured internationally across Europe, the U.K., and Australia; and supported superstars like Keith Urban, LANY, Luke Bryan, and NEEDTOBREATHE. With countless milestones to her name — including making her Tiny Desk debut in 2024 and scoring a No. 1 hit with “Hot Honey” (a collaboration with MULTI-PLATINUM DJ/producer Tiësto) — Springsteen’s momentum is undeniable.",
    "hasHeadshot": true,
    "headshotBytes": 4786543,
    "headshotFile": "/2026-headshots/portraits/alana-springsteen-2.jpg"
  },
  {
    "recordId": "recTfHxJ2wHFWLaMy",
    "name": "Forest Blakk",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Multi-Platinum Singer-Songwriter & Recording Artist",
    "bio": "Forest Blakk is a Canadian-born, Nashville-based multi-Platinum-selling singer/songwriter and spoken word artist whose work is rooted in one thing above all else: connection.\n\nWhether through a song, a poem, or a story, Blakk has built his career around turning the parts of life we often struggle to talk about into something that makes people feel seen and a little less alone.\n\nThat instinct comes from experience. Long before more than 1.7 billion career streams, Platinum records, and sold-out shows, Blakk knew what it meant to have life fall apart.\n\nWhile living out of his car and on friends’ couches in Los Angeles, he wrote what would eventually become his breakout hit, “If You Love Her.” The song went on to become 2× Platinum in the U.S. and 4× Platinum in Canada, with duet versions featuring Christina Perri and Meghan Trainor.\n\nBlakk has never been afraid to take the darker chapters of his past and turn them into words. Raised in a chaotic household by a mother struggling with addiction and a stepfather involved in organized crime, he found refuge in poetry and music through an upbringing marked by instability and homelessness. That honesty runs through his songwriting and spoken word, transforming deeply personal experiences into opportunities to connect.\n\nHis song “Fall Into Me,” co-written with Matchbox Twenty’s Rob Thomas, has amassed more than 290 million streams and is Platinum in Canada and Gold in the U.S. His collaborations also include “You’ll Be The Proof” featuring Joy Williams of The Civil Wars, which led to a performance on the 2026 finale of Love Is Blind. His music has appeared across film, television, and major campaigns, and he has toured alongside James Arthur, James Blunt, and NEEDTOBREATHE.\n\nFor Blakk, those milestones are a consequence of something much simpler. The point has never just been to write songs. It’s to tell the truth about where he’s been, turn it into something beautiful, and create the kind of connection that reminds people they aren’t going through this life alone.",
    "hasHeadshot": true,
    "headshotBytes": 281207,
    "headshotFile": "/2026-headshots/airtable-current/recTfHxJ2wHFWLaMy.jpg"
  },
  {
    "recordId": "rec5tGerudADgLUu9",
    "name": "David Eagleman",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "neuroscientist",
    "organization": "",
    "title": "Neuroscientist, Stanford University",
    "bio": "David Eagleman is a neuroscientist at Stanford University, an internationally bestselling author, and a Guggenheim Fellow. Dr. Eagleman’s areas of research include sensory substitution, time perception, vision, and synesthesia; he also studies the intersection of neuroscience with the legal system, and in that capacity he directs the Center for Science and Law. Eagleman is the author of many books, including Livewired, The Runaway Species, The Brain, Incognito, and Wednesday is Indigo Blue. He is also the author of a widely adopted textbook on cognitive neuroscience, Brain and Behavior, as well as a bestselling book of literary fiction, Sum, which has been translated into 32 languages, turned into two operas, and named a Best Book of the Year by Barnes and Noble. Dr. Eagleman writes for the Atlantic, New York Times, Economist, Time, Discover, Slate, Wired, and New Scientist, and appears regularly on National Public Radio and BBC to discuss both science and literature. He has been a TED speaker, a guest on the Colbert Report, and profiled in the New Yorker magazine. He has spun several neurotech companies out of his lab. He runs the top ranking science podcast Inner Cosmos and is the writer and presenter of The Brain, an Emmy-nominated television series.",
    "hasHeadshot": true,
    "headshotBytes": 3291343,
    "headshotFile": "/2026-headshots/portraits/david-eagleman.jpg"
  },
  {
    "recordId": "recD5l8Ltr2oUGnUI",
    "name": "Blaise Aguirre",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "Psychiatrist",
    "organization": "",
    "title": "Assistant Professor of Psychiatry, Harvard Medical School",
    "bio": "Blaise Aguirre, MD, is an expert in child psychiatry, including psychotherapy and psychopharmacology. He has worked extensively with children and their families and is an author and speaker on various aspects of mood, personality, and development in children and adolescents. He is a trainer in Dialectical Behavior Therapy. He is the founding medical director of 3East at Harvard-affiliated McLean Hospital, a continuum of care using dialectical behavior therapy (DBT) program for young people manifesting self-endangering behaviors and borderline personality traits. He is an Assistant Professor of Psychiatry at Harvard Medical School. He has written more than 25 books on meditation, borderline personality disorder, DBT, and self-hatred.",
    "hasHeadshot": true,
    "headshotBytes": 85266,
    "headshotFile": "/2026-headshots/portraits/blaise-aguirre.jpg"
  },
  {
    "recordId": "recD1Uj6efFlTpWiv",
    "name": "Isabella Wolfington",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "Associate Producer, Not Alone Summit & AI House Fellow",
    "bio": "Isabella Wolfington is a student, a member of AI House, and an Associate Producer of the Not Alone Summit. She helps automate processes for the Inspiring Children Foundation, using AI to support the team’s work and improve day-to-day operations. Through her involvement with the foundation and Summit, she contributes to initiatives that advance mental health, support young people, and encourage meaningful connection.",
    "hasHeadshot": true,
    "headshotBytes": 920672,
    "headshotFile": "/2026-headshots/portraits/isabella-wolfington.jpg"
  },
  {
    "recordId": "recWyQHmaVdMKfrih",
    "name": "Raquelle Stevens",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Podcast host",
    "organization": "",
    "title": "Author & Producer",
    "bio": "Raquelle is a Los Angeles–based philanthropic advisor, bestselling author, producer, and advocate whose work is dedicated to advancing mental health through storytelling, strategic partnerships, and philanthropy. She is the author of The Sunshine Mind and has contributed to acclaimed projects including the Emmy-nominated Selena + Chef and the Apple Original documentary Selena Gomez: My Mind & Me. She serves on the boards of United Friends of the Children and the Los Angeles Dream Center, championing initiatives that promote mental health, empower youth, and strengthen communities.",
    "hasHeadshot": true,
    "headshotBytes": 201502,
    "headshotFile": "/2026-headshots/airtable-current/recWyQHmaVdMKfrih.jpg"
  },
  {
    "recordId": "recY07YSwblGLztgq",
    "name": "Jen Smorgon",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "Smorgan Family Foundation",
    "title": "Founder & Mindfulness Expert",
    "bio": "Jennifer Smorgon is a Vedic meditation teacher, speaker, and mentor for the NEXUS Global Summit community. She is joining the NEXUS Impact Society as a Scholar in Residence cultivating an awareness of conscious leadership skills for its members. She is passionate about innovative approaches to health, the mind, and the role of technology in humanity. In the United States, she is a founding member of The Chopra Foundation’s Self-Directed Biological Transformation Initiative. She is also the past Vice Chair of the Chopra Foundation Board and a current advisor. In Israel, Jennifer serves on the board of the Mem Foundation supporting an array of social impact and community projects. Jennifer is a mentor to individuals, family offices, and global communities. Jennifer lives in San Francisco along with her husband and their five children.",
    "hasHeadshot": true,
    "headshotBytes": 22687,
    "headshotFile": "/2026-headshots/portraits/jen-smorgon.jpg"
  },
  {
    "recordId": "recxnLRNlnoNkOImp",
    "name": "Sean Wolfington",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Film Producer",
    "bio": "Sean Wolfington is a technology entrepreneur with businesses in the automotive, ad-tech and film industries.\n\nWolfington is the founder and chairman of CarSaver, a mobile auto buying platform that is Walmart’s exclusive partner for auto sales, finance and insurance. CarSaver helps Walmart’s 250 million customers use their mobile phones to shop, buy, finance, lease and insure all brands of new and used cars through their network of dealers, banks and insurance providers. Wolfington also owns a group of auto-tech companies, including Data Driven Holdings, Team Velocity, Tier 10, Level 5, Social Dealer, Offer Logix and Los Angeles Honda.",
    "hasHeadshot": true,
    "headshotBytes": 249429,
    "headshotFile": "/2026-headshots/portraits/sean-wolfington-hd-20261015.jpg"
  },
  {
    "recordId": "recjSe6G2Qj50IleV",
    "name": "Ana Wolfington",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Philanthropist & Creative Producer",
    "bio": "Ana Wolfington is a philanthropist and creative producer dedicated to advancing faith-driven storytelling, education, and humanitarian causes. Through her involvement with The Wolfington Companies and the Cabrini Foundation, she supports projects that blend art, service, and purpose, continuing her family’s legacy of values-based entrepreneurship and compassion.",
    "hasHeadshot": true,
    "headshotBytes": 447560,
    "headshotFile": "/2026-headshots/portraits/ana-wolfington.jpg"
  },
  {
    "recordId": "receZ4AeROyhMMnjY",
    "name": "Janet Wozniak",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Mathematician, Computer Scientist & Education Advocate",
    "bio": "Janet Wozniak is a mathematician, computer scientist and biologist with a longstanding interest in education, technology and well-being. A former Apple education instructor, she supports charitable initiatives alongside her husband, Apple co-founder Steve Wozniak, and advocates for following one’s passions, living authentically and expanding access to meaningful educational opportunities.",
    "hasHeadshot": true,
    "headshotBytes": 236814,
    "headshotFile": "/2026-headshots/portraits/janet-wozniak-4.png"
  },
  {
    "recordId": "recmtGEPHjplKheEU",
    "name": "Cathy Olson",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "Press",
    "organization": "Forbes",
    "title": "Founder, Hollywood & Mind; Contributor, Forbes",
    "bio": "Cathy Applefeld Olson is a social impact entrepreneur and veteran entertainment industry journalist. She is the founder and CEO of Hollywood & Mind, the entertainment industry’s collective advancing positive mental health through events, initiatives, intersectional dialog and storytelling. Hollywood & Mind supports those who work across music, film, TV, the creator ecosystem, tech and sports, while also helping scale the role of people and industries of influence to spark hope, spur action and disseminate resources out in the culture. The fifth annual Summit will take place in May in Los Angeles and On Location events bring conversations and community to cities including Nashville, New York, Atlanta, and DC.\n\nA graduate of Northwestern University’s Medill School of Journalism, Cathy has spent most of her professional career reporting on the music and entertainment industries, and sharing stories of artists, actors and executives for publications including Billboard, The Hollywood Reporter, Cynopsis and Cablefax. She remains a frequent contributor to Billboard and has a platform covering entertainment on Forbes.com, home of her column Mind Reading, which features interviews with culture influencers about their mental health journeys.\n\nCathy and her husband Brent are the parents of two young women, Olivia and Jacqueline, who inspire them every day. When she’s not immersed in family time or work, you can probably find her out listening to live music.",
    "hasHeadshot": true,
    "headshotBytes": 994871,
    "headshotFile": "/2026-headshots/portraits/cathy-olson.jpg"
  },
  {
    "recordId": "recgoVJ4ChRO9rSny",
    "name": "Jeff Levin",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Talent Manager",
    "organization": "Impaulsive",
    "title": "Talent Manager",
    "bio": "From pioneering the YouTube economy with AwesomenessTV, the first digital media company to sell in the space when it was acquired by DreamWorks, to managing Logan Paul for over a decade, Jeff has spent his career at the intersection of creators, commerce, and culture. Along the way he has helped orchestrate global moments like Logan’s boxing match against Floyd Mayweather and his transition into the WWE, while building creator-led brands such as Prime that has surpassed $1B in global sales all driven by a passion for turning creator energy into real-world business impact.",
    "hasHeadshot": true,
    "headshotBytes": 4548436,
    "headshotFile": "/2026-headshots/portraits/jeff-levin.jpg"
  },
  {
    "recordId": "recJ6iaa7o57IPBgK",
    "name": "Mike Tyson",
    "status": "Withdrew",
    "groups": [
      "A-Talent",
      "3"
    ],
    "occupation": "Boxer",
    "organization": "",
    "title": "Former Professional Boxer & Entrepreneur",
    "bio": "With nicknames such as “Iron” Mike, Kid Dynamite, and The Baddest Man on the Planet, Tyson’s legacy is undisputed. One of the most feared boxers in the ring, his resume proves he is one of the boxing greats: in addition to being the Undisputed Heavyweight Champion, Tyson holds the record as the youngest boxer to win the WBC, WBA, and IBF world heavyweight titles. He was also the first heavyweight boxer to hold the WBA, WBC, and IBF titles simultaneously, In 2011, Tyson was inducted into the Boxing Hall of Fame, and in 2013 he was inaugurated into the Las Vegas Hall of Fame and his memoir Undisputed Truth, written with Larry Sloman became a NYT best seller.\n\nTyson’s enduring mass appeal is not only because of his incomparable athleticism, but due to his interesting and exciting personality, along with his unrivaled showmanship. His ability to work a crowd extends far beyond the ring. Tyson’s career in entertainment spans everything from blockbuster movies (The Hangover and The Hangover 2) to documentaries. He has also toured nationally and internationally with his critically acclaimed Broadway one-man show, Mike Tyson: UNDISPUTED TRUTH, which additionally aired as an HBO special. After a successful run at MGM Grand’s Hollywood Theater, the show debuted on Broadway under famed director Spike Lee, before a return to the MGM and a national tour.",
    "hasHeadshot": true,
    "headshotBytes": 33773,
    "headshotFile": "/2026-headshots/portraits/mike-tyson-3-c.jpg"
  },
  {
    "recordId": "rec2VyMC3lhRGOdJQ",
    "name": "Darryl DMC McDaniels",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent",
      "5"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Hip-Hop Pioneer, Founding Member of Run-DMC & Mental Health Advocate",
    "bio": "Innovator, Motivator, Philanthropist, Darryl “DMC” McDaniels changed music and made history when he broke down cultural barriers with his legendary band Run-DMC. Fifty million record sales and over a billion streams later, he continues to inspire & impact the world…\n\nDarryl “DMC” McDaniels is a legendary music icon who first impacted the world more than 40 years ago when RUN DMC made their recording debut “It’s Like That/ Sucker MCs” (Profile Records) From the first rap group to grace the cover of Rolling Stone Magazine to the first to appear on MTV, DMC helped changed music, culture, fashion, language and made American history. It would be hard to overstate his influence on popular culture.\n\nFifty million+ physical record sales and over a billion song streams later, DMC still continues to create, inspire and motivate. In 2009, as a founding member of Run DMC, he was inducted into the Rock and Roll Hall of Fame and in 2016 he received a Grammy Lifetime Achievement Award from the Recording Academy given to “performers who, during their lifetimes, have made creative contributions of outstanding artistic significance to the field of recording.”\n\nHis label King of Rock Entertainment just released his latest single “She Gets Me High” featuring Sebastian Bach, Mick Mars, Duff McKagan and Travis Barker. (LISTEN) with a new EP and vinyl album on the way. (LISTEN)\n\nHis cookie company Darryl Makes Cookies featuring his favorite cookies (chocolate chip and a seasonal holiday sugar cookie called ‘Christmas In Hollis’) and his comics and graphic novels from Darryl Makes Comics continue to delight fans.\n\nIn addition to his cookies and comics, Darryl has released two children’s book in in his Young DMC publishing series; “Darryl’s Dream” (KORE/Random House/2023) and most recently “Darryl’s Christmas in Hollis (Blue Balloon Books).\n\nHe is also the co-author of two critically acclaimed books: his memoir entitled, Ten Ways Not to Commit Suicide (2016/Harpers/Amistad) giving him another platform to talk about his past struggles with depression and helping those, especially men of color, remove the shame of asking for help and his autobiography, “King of Rock: Respect, Responsibility, and My Life with Run- DMC” (2001/ Out of Print)\n\nIn 2006 Darryl released the hit single “Just like Me” featuring Sarah McLachlan; a song he wrote after discovering he was adopted. The song spoke to his new revelation and began his journey down another life path, in search of his birth mother. While his search struggle was captured in the 2007 Emmy Winning VH1 documentary DMC: My Adoption Journey, the process gave DMC tremendous insight and purpose, prompting him to become an advocate for adoption and children in foster care.\n\nIn 2006 he co-founded the Felix Organization with Hollywood casting agent Sheila Jaffe- a nonprofit that works to provide inspiring opportunities and new experiences to enrich the lives of children who are growing in the foster care system. http://www.thefelixorganization.org In between his work as a musical artist and producer, published author and speaker, philanthropist and advocate, McDaniels finds time to talk with school kids across the country about respect, responsibility, and self-awareness. One of his many memorable engagements included an invitation in 2015 by former President Barack Obama to speak at the White House to a group of young men about fatherhood.\n\nDarryl has also appeared before Congress and various State legislatures in support of adoptees and foster children, worked with former First Lady Michelle Obama on part of her “Get Fit” Campaign, was a featured speaker at the 2016 Kennedy Forum #Young Minds Matter event on Mental Health, and was a featured speaker at the 2017 SXSW Music Festival and 2017 Kennedy Center Honors to name a few.\n\nDarryl “DMC” McDaniels serves on the Board of Directors of The Garden of Dreams Foundation, a non-profit charity that works closely with all areas of The Madison Square Garden Company, including the Knicks, Rangers, Liberty, MSG Entertainment and MSG Media, to make dreams come true for children facing obstacles.\n\nHe has partnered with Uwill, the leading mental health and wellness solution supporting 3 million students at 400 schools, as a mental health advocate is a member of Stevie Van Zandt’s TeachRock Artist Council, and isan Advisory Board Member for Hip Hop Public Health, an organization whose mission “is to foster positive health behavior change through the transformative power of hip- hop music.”",
    "hasHeadshot": true,
    "headshotBytes": 154260,
    "headshotFile": "/2026-headshots/portraits/darryl-mcdaniels-2-c.jpg"
  },
  {
    "recordId": "recAwr1mM0YIHXMNG",
    "name": "Gavin Magnus",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer, Rapper & Actor",
    "bio": "Gavin Magnus is known for being an actor, artist and huge social media star on YouTube and Instagram. His social media channels generated over 30 million views and have reached over one million incredible fans across YouTube, Instagram and Tik Tok. He is also known for Dreamworks TV series 'When Sports Collide' and the role of Byron in \"Timecrafters\" a feature film alongside Denise Richards. Gavin is an American child actor who has enjoyed rapping, singing, dancing and acting since he could walk. As an actor he appeared on important networks such as Nickelodeon and Cartoon Network. As an artist he later went on the Boys of Summer Tour 2018 and signed an album deal to release a single called \"Crushin\" with Piper Rockelle. Both stars are costars in each other's YouTube series. Crushin has now reached more than 5 million views in two months. Furthermore, he was lucky enough to collaborate with Anthony Padilla of 'Smosh' and was recently ranked #2 for 'most popular 12 year old' on Famous Birthdays ranking. Most importantly, Gavin is an animal activist, often involved in hospitals charity events with a huge heart for helping others and has used his influence several times to raise awareness for school harassment.",
    "hasHeadshot": true,
    "headshotBytes": 273387,
    "headshotFile": "/2026-headshots/portraits/gavin-magnus-hd-20261015.jpg"
  },
  {
    "recordId": "rec21VwaMaoSYXXtF",
    "name": "Bianca Mok",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "ICF Alumni, Not Alone Summit Associate Producer",
    "bio": "Bianca Mok is a Programming Coordinator at the Inspiring Children Foundation and an Associate Producer of the Not Alone Summit. She has worked with ICF since 2019, helping produce the Wellness Your Way Festival, the Wellness Experience, and both the inaugural and second year of the Not Alone Summit. Bianca also helps put on the other events ICF hosts throughout the year and creates the foundation’s impact reports, supporting its work to advance young people’s physical, emotional, and mental well-being.",
    "hasHeadshot": true,
    "headshotBytes": 4735742,
    "headshotFile": "/2026-headshots/portraits/bianca-mok.jpg"
  },
  {
    "recordId": "recJUrsEWJQ4y3T85",
    "name": "Casey Caruso",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "ICF Alumni, Not Alone Summit Associate Producer & Event Producer",
    "bio": "Casey Caruso is an event producer and mental health advocate who serves as Event Manager at the Inspiring Children Foundation and Executive Producer of the #NotAloneChallenge. Casey’s work supports efforts to raise mental health awareness and expand access to resources for underserved communities. As an Associate Producer of the Not Alone Summit, Casey helps bring together artists, advocates, and leaders for experiences centered on storytelling, emotional well-being, and human connection.",
    "hasHeadshot": true,
    "headshotBytes": 2587316,
    "headshotFile": "/2026-headshots/portraits/casey-caruso-c.jpg"
  },
  {
    "recordId": "rec8JOTjXDK50a0Fn",
    "name": "Payton McDonald",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "Assistant Manager & Not Alone Summit Associate Producer; Executive Assistant to Aphrah Brokaw",
    "bio": "Payton McDonald is a member of the Inspiring Children Foundation team and an Associate Producer of the Not Alone Summit. A graduate of the University of Oregon’s Lundquist College of Business with a background in finance, she earned recognition from Delta Gamma for her leadership, dedication, and service. Through her work with the foundation and Summit, Payton supports initiatives that advance mental health, empower young people, and bring communities together through meaningful connection.",
    "hasHeadshot": true,
    "headshotBytes": 241983,
    "headshotFile": "/2026-headshots/portraits/payton-mcdonald-c.jpg"
  },
  {
    "recordId": "recdXBmt9miFCx8rX",
    "name": "Seth Porter Winterton",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "ICF Alumni & Musical Director",
    "bio": "Seth Porter Winterton is the Inspiring Artists Director at the Inspiring Children Foundation and an Associate Producer of the Not Alone Summit. Through these roles, he supports the foundation’s mission to advance young people’s physical, emotional, and mental well-being. His work with the Summit helps bring together creativity, storytelling, and conversations about mental health, supporting an event designed to encourage healing and human connection.",
    "hasHeadshot": true,
    "headshotBytes": 1449321,
    "headshotFile": "/2026-headshots/portraits/seth-porter-winterton-c.jpg"
  },
  {
    "recordId": "recRFubkFSL4LTnRL",
    "name": "Sydney King",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "Community Manager & Not Alone Summit Associate Producer",
    "bio": "Sydney King is an alumna and Community Manager at the Inspiring Children Foundation, as well as an Associate Producer of the Not Alone Summit. Her work has included supporting the Jewel Never Broken community and contributing to the foundation’s mental fitness resources. Drawing on her experience within ICF, Sydney helps advance initiatives that bring people together and make tools for emotional well-being more accessible.",
    "hasHeadshot": true,
    "headshotBytes": 509956,
    "headshotFile": "/2026-headshots/airtable-current/recRFubkFSL4LTnRL.jpg"
  },
  {
    "recordId": "rec0WmJ1UAFnTEWYh",
    "name": "Nick Ekern",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "ICF Alumni & Director of Marketing",
    "bio": "Nick Ekern is the Director of Marketing at the Inspiring Children Foundation and an Associate Producer of the Not Alone Summit. Raised near Seattle, Washington, he was a collegiate tennis player and honors student at George Fox University. His own experiences with anxiety and depression inspired a commitment to helping others access tools for emotional well-being. Today, Nick oversees the foundation’s marketing and technology efforts, supports operations, and occasionally coaches tennis, combining his professional skills with a personal passion for youth development and mental health.",
    "hasHeadshot": true,
    "headshotBytes": 2055895,
    "headshotFile": "/2026-headshots/portraits/nick-ekern-c.jpg"
  },
  {
    "recordId": "rec1v3EzNaYVFlIoN",
    "name": "Ricky Sypert",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "ICF Alumni & Manager",
    "bio": "Ricky Sypert is an alumnus and Manager of the Inspiring Children Foundation, Team Bryan Manager, and an Associate Producer of the Not Alone Summit. A certified tennis teaching professional and graduate of the No Quit Tennis Academy program, he now oversees the academy’s junior tennis programming, including scheduling, development, and operations. Drawing on his own experience in the program, Ricky uses tennis as a pathway to personal growth, helping young people build skills that extend beyond the court.",
    "hasHeadshot": true,
    "headshotBytes": 450327,
    "headshotFile": "/2026-headshots/portraits/ricky-sypert-c.jpg"
  },
  {
    "recordId": "recUODHCLbJTR7fd7",
    "name": "Cherrial Odell",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer",
      "Co-Chair",
      "F - talent"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "ICF Alumna, Stanford Graduate & Founder, Wellness Buddies",
    "bio": "Cherrial Odell has risen above extreme childhood trauma to find peace of mind and levels of joy so meaningful they bring her tears of joy. She is a two-time suicide attempt survivor, lived-experience mental health advocate, and psychology student at Stanford University. Her message and story is one of hope and healing, and she uses her journey to now help others do the same.\n\nHer advocacy has been featured in People magazine, The Kelly Clarkson Show, and at national conferences and festivals. An alumni of Jewel’s Inspiring Children Foundation, where she served as an intern, ambassador, and now Alumni Board Co-Chair, Cherrial continues to mentor countless young people as a peer support specialist and peer counselor.\n\nAt Stanford, she serves as President of the Mental Health Outreach Club, co-founded “Wellness Buddies” with Jewel and ICF, created the largest mental health movement in Stanford history: Flourish Stories, and was named a Top 50 finalist for the Chegg Global Student Award. During COVID-19, she launched Inspire House, a community that reached 2.7 million people, and created “Inspire Cards,” a mental health tool to help people learn how to have deeper conversations.\n\nCherrial previously served on Lady Gaga’s Born This Way Foundation Advisory Board and as a Rare Impact College Ambassador with Selena Gomez’s nonprofit, continuing to amplify hope, healing, and resilience worldwide.",
    "hasHeadshot": true,
    "headshotBytes": 62043,
    "headshotFile": "/2026-headshots/portraits/cherrial-odell-20261015.jpg"
  },
  {
    "recordId": "recbGihz8WzPHqCia",
    "name": "Harvey Stern",
    "status": "Confirmed Attendance",
    "groups": [],
    "occupation": "F&B",
    "organization": "",
    "title": "Hospitality Leader & Event Specialist",
    "bio": "Harvey Stern is a hospitality professional whose career spans more than four decades in catering, events, and leadership. He previously served as Executive Director of Catering and Banquets at Bellagio, with earlier experience at the Pierre Hotel, Four Seasons Chicago, and the Standard Club of Chicago. A Rochester Institute of Technology graduate and recipient of its Special Service Award, Harvey is also a mentor and speaker who helps hospitality professionals develop their careers and create exceptional guest experiences",
    "hasHeadshot": true,
    "headshotBytes": 559429,
    "headshotFile": "/2026-headshots/portraits/harvey-stern-2-c.jpg"
  },
  {
    "recordId": "recgBjNLwCZJNBZF9",
    "name": "Deb Cullen",
    "status": "Confirmed Attendance",
    "groups": [
      "Co-Producer"
    ],
    "occupation": "",
    "organization": "",
    "title": "Television Producer & Not Alone Summit Producer",
    "bio": "Deb Cullen is a television producer whose credits span comedy, talk shows, game shows, and entertainment specials. Her work includes Talk Show the Game Show, Cannonball, and Who Wants to Be a Millionaire, along with a co-executive producer credit on Stand Out: An LGBTQ+ Celebration. As a producer of the Not Alone Summit, Deb brings her experience in entertainment production to an event centered on mental health, connection, and community.",
    "hasHeadshot": true,
    "headshotBytes": 386225,
    "headshotFile": "/2026-headshots/portraits/deb-cullen-c.jpg"
  },
  {
    "recordId": "recsDZyoyuUppH5Q9",
    "name": "Max Novak",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "Director of Programming & Not Alone Summit Associate Producer",
    "bio": "Max Novak is an alumnus and Director of Programming at the Inspiring Children Foundation, as well as an Associate Producer of the Not Alone Summit. Having participated in the foundation’s programs himself, he now helps guide the next generation through mentorship and youth development. Foundation participants have credited his support with helping them grow as leaders and pursue opportunities through education and tennis.",
    "hasHeadshot": true,
    "headshotBytes": 704785,
    "headshotFile": "/2026-headshots/portraits/max-novak-c.jpg"
  },
  {
    "recordId": "rectmJGtCAF3d7Woa",
    "name": "Will Elmore Jr.",
    "status": "Confirmed Attendance",
    "groups": [
      "Associate Producer"
    ],
    "occupation": "",
    "organization": "Inspiring Children Foundation",
    "title": "Operations Manager & Not Alone Summit Associate Producer",
    "bio": "Will Elmore Jr. is an Inspiring Children Foundation alumnus and Operations Manager who also serves as an Associate Producer of the Not Alone Summit. With the foundation’s support, he attended Villanova University, graduated with a double major, and became one of the tennis program’s most successful doubles players. Today, Will contributes to the organization that helped shape his journey, bringing his experience as a student-athlete and alumnus to its work supporting young people.",
    "hasHeadshot": true,
    "headshotBytes": 246581,
    "headshotFile": "/2026-headshots/airtable-current/rectmJGtCAF3d7Woa.jpg"
  },
  {
    "recordId": "rec9Ra0XaogvjnRGN",
    "name": "Nicole Kalhorn",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "Wise Friend",
    "title": "Co-Founder, Wise Friend",
    "bio": "Nicole Kalhorn is Co-Founder and Co-CEO of Wise Friend, a company working to make behavioral health education and tools more accessible. A Princeton University graduate and former women’s tennis captain, she earned three First Team All-Ivy League honors and served as president of Princeton’s Class of 2019. Through her leadership roles with USTA Nevada and the USTA’s national diversity and inclusion committee, Nicole combines her background in athletics with a commitment to mental well-being and expanding opportunity.",
    "hasHeadshot": true,
    "headshotBytes": 85135,
    "headshotFile": "/2026-headshots/portraits/nicole-kalhorn-c.jpg"
  },
  {
    "recordId": "recA1UhSPyb3vqTaw",
    "name": "Clayton Alenik",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "Wise Friend",
    "title": "Co-Founder, Wise Friend",
    "bio": "Clayton Alenik is the co-founder of Wise Friend, a company revolutionizing behavioral health by using AI to make evidence-based tools more accessible and scalable. Wise Friend partners with the Inspiring Children Foundation to professionalize their renowned curriculum and mentorship program—distilling two decades of lived-experience wisdom and clinical best practices into an interactive, tech-enabled platform.\n\nClayton was first introduced to mental health tools through the Inspiring Children Foundation as a teenager, where he began cultivating mindfulness, emotional intelligence, and self-awareness to navigate the grief of losing his father. That experience sparked a lifelong commitment to inner work and service.\n\nBefore launching Wise Friend, Clayton joined SaksWorks, where he helped integrate mental, physical, and emotional well-being initiatives into professional environments—bridging the gap between corporate performance and personal fulfillment.\n\nToday, through Wise Friend, Clayton is at the forefront of a new wave of mental health innovation—combining human mentorship, behavioral science, and AI to help individuals reconnect with themselves, each other, and their potential.",
    "hasHeadshot": true,
    "headshotBytes": 1412551,
    "headshotFile": "/2026-headshots/airtable-current/recA1UhSPyb3vqTaw.jpg"
  },
  {
    "recordId": "recHg8FKPKU0mEgmT",
    "name": "Sarah Gilman",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "Actress",
    "organization": "",
    "title": "Actress",
    "bio": "Sarah Gilman is an actress dedicated to using her voice, platform, and lived experience to increase awareness and education around mental health and suicide prevention. With a Magna Cum Laude degree from the USC School of Cinematic Arts, a varied background in communications and marketing, and over 15 years acting in film and television, Sarah believes deeply in the power of informed storytelling to make advocacy accessible and create lasting societal change.\n\nOn-screen, Sarah’s acting roles include Penny Gill in CBS’s CSI: Vegas, Delia Delfano on the Disney Channel sitcom I Didn’t Do It, Velma in the feature film Daphne & Velma, and Cammy on FOX’s Last Man Standing. Off-screen, Sarah has partnered with various mental health organizations as a passionate advocate and voice in the mental health space. Through digital and in-person collaborations with organizations including AFSP, To Write Love On Her Arms, Fountain House, Get Lit, Center for Scholars and Storytellers at UCLA, and Self Care is For Everyone, Sarah has shared experience and education through countless public events, podcasts, and panels. She is a Mental Health Coalition Champion and a Board Advisor at Didi Hirsch Mental Health Services where she founded and chairs the Next Gen Advisory Council.\n\nA lifelong learner, Sarah is currently building a personal library–currently at 1,301 books–and is always looking for recommendations.",
    "hasHeadshot": true,
    "headshotBytes": 17285,
    "headshotFile": "/2026-headshots/portraits/sarah-gilman-2-c.jpg"
  },
  {
    "recordId": "reciHZAZxnu1f2EuS",
    "name": "Silas Luke Jones",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Guitarist",
    "bio": "Silas Luke Jones is an Alaskan born and raised guitarist, songwriter, and full-time musician known for his expressive fingerstyle playing and percussive acoustic guitar style. He began playing guitar at age 10 and developed a distinctive approach combining fingerpicking, tapping, percussion, and melodic arrangements to create a full, rhythmic sound from a single instrument.\n\nAn experienced live performer, Silas has spent years performing weddings, private events, and live shows across the country, bringing an energetic and dynamic solo guitar approach to every performance.\n\nSilas also shares performances, original music, and gear-focused content with a growing online audience that has reached millions of viewers. He is passionate about pushing the possibilities of the acoustic guitar and using technology to capture and enhance its natural voice.",
    "hasHeadshot": true,
    "headshotBytes": 56146,
    "headshotFile": "/2026-headshots/portraits/silas-luke-jones-2-c.jpg"
  },
  {
    "recordId": "recnhLeRSENhRfSLM",
    "name": "JP Saxe",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter",
    "bio": "JP Saxe is a Toronto-born singer-songwriter and multi-instrumentalist known for his intimate lyrics and soulful, piano-driven pop. His breakthrough duet with Julia Michaels, “If the World Was Ending,” earned a Grammy nomination for Song of the Year and surpassed one billion streams. Named Breakthrough Artist of the Year at the 2021 JUNO Awards, he has also collaborated with artists including Maren Morris. Through songs about love, loss, and self-discovery, JP brings emotional honesty to his music, giving listeners space to recognize their own experiences.",
    "hasHeadshot": true,
    "headshotBytes": 607416,
    "headshotFile": "/2026-headshots/portraits/jp-saxe-c.jpg"
  },
  {
    "recordId": "recnyWzq2ubeVmXsm",
    "name": "Atz Kilcher",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter, Author & Veteran",
    "bio": "Atz Kilcher is a singer-songwriter, author, and Vietnam veteran raised on his family’s homestead in Homer, Alaska. Known as the patriarch of Discovery’s Alaska: The Last Frontier, he shares stories of resilience and personal growth through music and his memoir, Son of a Midnight Land. Beyond entertainment, Atz works with fellow veterans through Project Healing Waters, drawing on his own experiences with trauma to encourage healing through storytelling, music, nature, and shared connection. He received the Not Alone Service Award in 2025.",
    "hasHeadshot": true,
    "headshotBytes": 636424,
    "headshotFile": "/2026-headshots/portraits/atz-kilcher-c.jpg"
  },
  {
    "recordId": "rectTFBmVOINHypYQ",
    "name": "Bishop Briggs",
    "status": "Confirmed Attendance",
    "groups": [
      "A-Talent"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter & Performer",
    "bio": "Bishop Briggs (Sarah McLaughlin) is an electrifying singer-songwriter known for her powerful voice and genre-blending sound. Bishop gained prominence when she released her second-ever single, \"River,\" and scored multi-platinum sales, boasting over 1 BILLION streams.\n\nShe named herself after her parents' hometown of Bishopbriggs, Scotland.\n\nHer 2016 debut EP featured tracks like “Wild Horses” and “The Fire,” while her 2020 album “Champion” debuted at No. 1 on the iTunes Alternative Chart. Bishop also wrote the theme song for Netflix’s “Devil in Ohio,” the number-one show on the platform, and won the 9th season of The Masked Singer.\n\nMost recently, Bishop Briggs released her third studio album, Tell My Therapist I’m Fine, in 2024. The album explores themes of resilience, self-empowerment, and personal growth, marking a bold new chapter in her career. In 2025, she released the deluxe version of the album, which includes the empowering single “Woman Is King.” The record has been praised for its dynamic energy and emotional depth, showcasing her continued evolution as an artist Having played major festivals like Coachella and Lollapalooza, Bishop is known for captivating audiences with her emotive performances and resonant themes. This spring, Bishop embarks on her Tell My Therapist I’m Fine tour, bringing her unforgettable live shows to fans all over the United States",
    "hasHeadshot": true,
    "headshotBytes": 17664,
    "headshotFile": "/2026-headshots/portraits/bishop-briggs.jpg"
  },
  {
    "recordId": "recKnTXzRvPPusd3z",
    "name": "Jennifer Karson-Strauss",
    "status": "Hold Space - 75%",
    "groups": [
      "F - talent"
    ],
    "occupation": "Emmy Award Winning Documentarian who works with ESPN (Won an emmy for the Katie Meyer Doc)",
    "organization": "ESPN",
    "title": "Producer at ESPN",
    "bio": "Jennifer Karson-Strauss is an Emmy Award–winning documentary director and producer at ESPN. Originally from Frazier Park, California, she played Division I soccer at Pepperdine University before building a career in sports storytelling. Her work includes Save: The Katie Meyer Story, which received a Sports Emmy for Outstanding Journalism, and No Place Like Nebraska, an intimate look at Nebraska’s women’s volleyball team. Through these films, she explores the lives behind athletic achievement, bringing attention to mental health, personal loss, and the pressures facing student-athletes.",
    "hasHeadshot": true,
    "headshotBytes": 148141,
    "headshotFile": "/2026-headshots/portraits/jennifer-karson-strauss-2-c.jpg"
  },
  {
    "recordId": "recgN4s4V5qQi3C6D",
    "name": "Alexa Price",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Press",
    "organization": "Shorefire",
    "title": "Senior Publicist, Shore Fire Media",
    "bio": "Alexa Price is a Senior Publicist at Shore Fire Media. She began her career specializing in celebrity PR and joined Shore Fire in March of 2023. Since joining Shore Fire, she has played a pivotal role in successful campaigns for a variety of clients including musicians, talent, art museums and cultural institutions, non-profit foundations, and music venues. She attended Tulane University and resides in New York City.",
    "hasHeadshot": true,
    "headshotBytes": 131067,
    "headshotFile": "/2026-headshots/portraits/alexa-price-hd-20261015.jpg"
  },
  {
    "recordId": "recXlZUBDYKDm7zXU",
    "name": "Taylor Perry",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Press",
    "organization": "Shorefire",
    "title": "Senior Account Executive, Shore Fire Media",
    "bio": "Taylor Perry is a Senior Account Executive at Shore Fire Media, where she has contributed to campaigns for artists including Jewel, Samara Joy, James Taylor and Todd Rundgren. She joined Shore Fire in 2020 and has advanced through several roles within the company. Taylor graduated from NYU’s Clive Davis Institute with a degree in Recorded Music Entrepreneurship.",
    "hasHeadshot": true,
    "headshotBytes": 48833,
    "headshotFile": "/2026-headshots/portraits/taylor-perry.jpg"
  },
  {
    "recordId": "recVWLRzYl01Hc7y6",
    "name": "Allison Elbl",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Press",
    "organization": "Shorefire",
    "title": "Co-President, Shore Fire Media",
    "bio": "Allison Elbl is Co-President of Shore Fire Media and leads the company’s Los Angeles office. A veteran communications executive with more than 20 years of experience, she has spearheaded strategic publicity and marketing campaigns for prominent talent, musicians, brands and digital-media platforms. Before joining Shore Fire, Allison established the music department at ID PR. She is a UCLA graduate and is based in Los Angeles.",
    "hasHeadshot": true,
    "headshotBytes": 9738,
    "headshotFile": "/2026-headshots/portraits/allison-elbl.jpg"
  },
  {
    "recordId": "rechhH4qifyGuhIGJ",
    "name": "Heather Engellis",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Ray Lewis COO",
    "organization": "",
    "title": "Former University of Oregon Lacrosse Athlete",
    "bio": "Heather Engellis is a former University of Oregon women’s lacrosse team member from Northport, New York. Before joining Oregon’s Division I program, she was a four-year varsity athlete at Northport High School, earning Nike All-America recognition and serving as team captain. Her athletic background spans both lacrosse and soccer.",
    "hasHeadshot": true,
    "headshotBytes": 298570,
    "headshotFile": "/2026-headshots/airtable-current/rechhH4qifyGuhIGJ.jpg"
  },
  {
    "recordId": "recUVNIxEeUsz7zMF",
    "name": "Kelli DiSabatino",
    "status": "Withdrew",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Ray Lewis Foundation Head",
    "organization": "Ray of Hope",
    "title": "Nonprofit Leader & Recovery Housing Advocate",
    "bio": "Kelli DiSabatino is a Delaware nonprofit leader whose work supports people navigating substance use recovery, homelessness, and reentry after incarceration. She chairs Peace by Piece and has served as Chief Operating Officer of Aquila of Delaware. Her work has included housing programs that connect residents with counseling, education, job training, and practical support to build stability and independence.",
    "hasHeadshot": false
  },
  {
    "recordId": "recwZ9D748PyPfTSl",
    "name": "Francisco Correa-Juliá",
    "status": "Withdrew",
    "groups": [
      "F - talent"
    ],
    "occupation": "Boxing bullies",
    "organization": "Boxing Bullies",
    "title": "Nonprofit Leader & Government Relations Professional",
    "bio": "Francisco Correa-Juliá is a Puerto Rico–based professional with experience in nonprofit leadership and public affairs. He has served as Executive Director of the Fundación Puertorriqueña Síndrome Down, promoting inclusion and greater independence for people with Down syndrome. His work has included arts initiatives celebrating participants’ creativity and abilities, alongside government relations experience with Federal & State Consulting Group.",
    "hasHeadshot": true,
    "headshotBytes": 333531,
    "headshotFile": "/2026-headshots/airtable-current/recwZ9D748PyPfTSl.jpg"
  },
  {
    "recordId": "recEnswIl0eQ1DiQp",
    "name": "Laura Brady",
    "status": "Withdrew",
    "groups": [
      "F - talent"
    ],
    "occupation": "CEO of Paul Family Office",
    "organization": "Boxing Bullies",
    "title": "CEO, Paul Family Office",
    "bio": "Laura Brady is Chief Executive Officer of the Paul Family Office and Chief Operating Officer of Paul Reserve, where she oversees operations, investments, and accounting and tax strategy for Jake Paul's family office and broader enterprise. Based in West Palm Beach, she directs strategy across the office's portfolio and serves as a key point of contact for founders, fund managers, and co-investment partners working with Jake and his entities.\n\nLaura brings nearly two decades of experience at the intersection of institutional capital and growth. She was previously Executive Vice President at Strive, the venture-backed asset manager founded by Vivek Ramaswamy, where she led Client Solutions and Business Development and helped grow the firm to nearly $2.5 billion in AUM before it went public as a bitcoin treasury company. She also served as Chief Growth Officer at Thryve Wealth Management and spent nearly 15 years in capital markets at Bank of America and Knight Capital Group, working across equities trading, prime brokerage, and hedge fund consulting.\n\nLaura earned a BA in Government from Harvard University, where she captained the varsity ice hockey team.",
    "hasHeadshot": true,
    "headshotBytes": 2193798,
    "headshotFile": "/2026-headshots/airtable-current/recEnswIl0eQ1DiQp.jpg"
  },
  {
    "recordId": "rec8KwGvKFACbi2Fb",
    "name": "Miriam Isa",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent",
      "Founder"
    ],
    "occupation": "Leadership Coach & Speaker",
    "organization": "Flourish Trust",
    "title": "Leadership Coach & Speaker",
    "bio": "I was raised in Miami by a single mom, in a neighborhood that smelled like café con leche and sounded like a telenovela on full volume. My family—a loud, proud mix of Cuban and Lebanese refugees—believed in the American Dream like their lives depended on it. Because, well… they did.\n\nFor me, the stage was my way out of the hood. It started with acting, then turned into hosting, then transformed into speaking. Somehow, I went from dodging stray roosters in Miami to interviewing Hollywood’s biggest stars on E! News, NBC, ESPN Deportes, and Telemundo—racking up 300M+ YouTube views along the way. I learned that storytelling isn’t just entertainment—it’s power.\n\nNow, I use that power to electrify audiences around the world and to coach ambitious professionals to master their mindset. My message isn’t about playing it safe—it’s about getting uncomfortable, telling the truth, and becoming the boldest version of yourself.\n\nBeyond coaching, I’m a human rights advocate working on immigration reform (because no one should have to flee their home just to survive). I also partnered with Disney, FX, and Gilead Sciences to lead conversations on mental health, diversity in media, and ending the HIV epidemic. I am proud to have helped create \"Zero Hour,\" a podcast nominated for multiple awards for its mission-driven storytelling.",
    "hasHeadshot": true,
    "headshotBytes": 2521871,
    "headshotFile": "/2026-headshots/portraits/miriam-isa-hd-20261015.jpg"
  },
  {
    "recordId": "recrwl06NzH7yS09c",
    "name": "Josh Wolf",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "Comedian",
    "organization": "",
    "title": "Comedian, Writer & Television Personality",
    "bio": "Josh Wolf is a comedian, writer, and television personality known for his sharp wit and relatable humor. A frequent guest on major comedy networks, Wolf’s stand-up work and writing credits span comedy specials, late-night television, and digital series. Blending storytelling with insightful humor, he connects with audiences by reflecting on everyday life, parenting, and personal growth.",
    "hasHeadshot": true,
    "headshotBytes": 21575,
    "headshotFile": "/2026-headshots/portraits/josh-wolf-3-c.jpg"
  },
  {
    "recordId": "rec8ABLx7a6RQaSHx",
    "name": "Hal Fisher",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Sarah Steil - Husband",
    "organization": "",
    "title": "Not Alone Summit Guest",
    "bio": "Hal Fisher joins the Not Alone Summit alongside his wife, Sarah Steil, taking part in a gathering centered on mental health, connection, and the work of the Inspiring Children Foundation.",
    "hasHeadshot": true,
    "headshotBytes": 126996,
    "headshotFile": "/2026-headshots/portraits/hal-fisher-2.jpg"
  },
  {
    "recordId": "rec6Rq9niGUiPfPvF",
    "name": "Dr. Dan Burkhead",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Founder of IPCC, Las Vegas",
    "organization": "",
    "title": "Anesthesiology & Pain Medicine",
    "bio": "Dr. Daniel Burkhead, M.D., the founder and driving force behind Innovative Pain Care Center, is a distinguished medical professional with a profound commitment to improving the lives of his patients. Dr. Burkhead integrates his extensive experience with a genuine compassion towards individuals grappling with chronic pain.\n\nAfter obtaining a Bachelor of Science degree from the University of Michigan, he got his medical degree from Wayne State University in Detroit. He then moved to Seattle for his anesthesiology residency at the esteemed Virginia Mason Hospital. Following completion of his Pain Fellowship at the University of Washington, he moved to Las Vegas in the late 1990s. After working in a group practice for several years, Dr. Burkhead recognized a fundamental need for a pain management “Center of Excellence” in Southern Nevada. With this notion in mind, he founded Innovative Pain Care Center in the fall of 2001.\n\nDr. Burkhead’s vision of a multidisciplinary approach to the treatment of pain has now been streamlined within the practice, drawing the excellence and expertise of the next generation of providers to the clinic and surgery center. Innovative Pain Care Center, under Dr. Burkhead’s guidance, will always strive to be forward-thinking, promoting tailored solutions to each individual seeking specialized care. Dr. Burkhead and his esteemed colleagues, continuously seek education and training in cutting-edge techniques in order to remain at the forefront of medical advancements.\n\nAs an Assistant Clinical Professor at both UNLV School of Medicine and Touro University School of Medicine, Dr. Burkhead actively proctors medical students and residents. He is published in national medical journals and has given countless lectures regarding techniques and innovations in pain management throughout his several decades of clinical practice. In addition, he continues to promote Innovative Pain Care Center as a clinical research site and serves as Primary Investigator for several FDA-approved clinical trials.\n\nBeyond his clinical expertise, Dr. Burkhead is a staunch advocate for patient empowerment and education. His involvement in shaping legislation aligns with his commitment to breaking down barriers that impede individuals from receiving the pain relief they deserve. He was instrumental in working with the Nevada Department of Health and Human Services to provide regional education and practice implementation of opioid legislation in the state of Nevada. Dr. Burkhead has also actively participated in programs sponsored by the DEA in relation to the opioid crisis throughout the United States.\n\nDr. Burkhead has served his community by taking on the role of President of the Clark County Medical Society from 2019-2020. During this time, he spearheaded the successful implementation of numerous protocols for mitigation of the effects of Covid-19 in Southern Nevada. Under his direction, the organization created several public outreach efforts including programs involving mask and PPE procurement and distribution during the pandemic. As a result of his numerous public service contributions, Dr. Burkhead was awarded the “Distinguished Physician of the Year” Award for the State of Nevada in 2021.\n\nAs a thought leader in the intersection of healthcare policy, academia, and excellence in clinical medicine, Dr. Burkhead founded Innovative Pain Care Center with the well-being of the patients at the forefront of all policies. Through his continuous hard work and dedication to positive outcomes for patients, Dr. Burkhead continues to actively contribute to the success of Innovative Pain Care Center and the Las Vegas community in general.",
    "hasHeadshot": true,
    "headshotBytes": 252974,
    "headshotFile": "/2026-headshots/portraits/dan-burkhead-2-c.jpg"
  },
  {
    "recordId": "recR5ahiAtUhjmsnT",
    "name": "Jen Whalen",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Producer, writer",
    "organization": "",
    "title": "Producer, Director & Creative Director",
    "bio": "Jen Whalen is a Los Angeles–based producer, director, and writer whose work spans entertainment, advertising, and documentary storytelling. She has created projects for Warner Bros., Netflix, Hulu, Levi’s, and Specialized, with work earning Promax and Telly Awards. A former professional cyclist, Jen also brings her passion for sports and the outdoors to her filmmaking, including the documentary series Tour de Femmes.",
    "hasHeadshot": true,
    "headshotBytes": 270717,
    "headshotFile": "/2026-headshots/airtable-current/recR5ahiAtUhjmsnT.jpg"
  },
  {
    "recordId": "recDfhMkhPS5VEhaL",
    "name": "Erik Blamoville",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "DMC Manager",
    "organization": "",
    "title": "Music Manager",
    "bio": "Erik Blamoville is a music manager known for his longstanding work with Darryl “DMC” McDaniels and Run-DMC. Through Erik Blam Management, he has helped support the career of one of hip-hop’s pioneering voices. His background connects artist management with the music and cultural legacy of Run-DMC.",
    "hasHeadshot": true,
    "headshotBytes": 299359,
    "headshotFile": "/2026-headshots/portraits/erik-blamoville-c.jpg"
  },
  {
    "recordId": "recwfbAG03JmOJx26",
    "name": "DMC DJ",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent"
    ],
    "occupation": "DJ",
    "organization": "",
    "title": "DJ & Turntablist (DJ Charlie Chan Soprano)",
    "bio": "Quentenas Charles Beason, professionally known as DJ Charlie Chan Soprano, is a St. Louis DJ known for his longstanding work with Darryl “DMC” McDaniels. Mentored by the legendary Jam Master Jay, he has performed internationally alongside DMC, bringing Run-DMC’s music to audiences through live turntablism. His career reflects a deep connection to hip-hop’s history and the St. Louis music community.",
    "hasHeadshot": true,
    "headshotBytes": 309639,
    "headshotFile": "/2026-headshots/airtable-current/recwfbAG03JmOJx26.jpg"
  },
  {
    "recordId": "recazhW7wq3Mw11QA",
    "name": "Ryan Chen",
    "status": "Confirmed Attendance",
    "groups": [
      "Philanthropist",
      "D - talent"
    ],
    "occupation": "Cofounder, Neurogum",
    "organization": "",
    "title": "Co-Founder, Neuro",
    "bio": "Ryan Chen is the co-founder and CFO of Neuro, the leader in functional gum and mints, which he and Kent Yoshimura grew into a brand generating more than $100 million in annual revenue. Neuro has been named to the Inc. 5000 list of America's fastest-growing companies, and Ryan has been recognized as a Forbes 30 Under 30 honoree and a 2025 EY Entrepreneur Of The Year. A graduate of UC San Diego with degrees in chemistry and economics, he previously scaled a data strategy team at Hulu. Ryan is also an angel investor in companies spanning CPG to tech.\n\nA lifelong athlete, Ryan ran cross country and track and earned a black belt in Kendo before suffering a spinal cord injury at 19. With resilience and the love and support of family and friends, he threw himself back into the adventure of life, traveling the world and going on to become a certified sport pilot and advanced scuba diver. He is passionate about community and gives his time and resources to the nonprofits closest to his heart, including through Neuro's own philanthropic partnerships.",
    "hasHeadshot": true,
    "headshotBytes": 313814,
    "headshotFile": "/2026-headshots/airtable-current/recazhW7wq3Mw11QA.jpg"
  },
  {
    "recordId": "recBWr2jSjytnP63B",
    "name": "Remington Rhodes",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Harry Hudson's Manager/brother",
    "organization": "Hey, I'm Here For You",
    "title": "Artist Manager & Caregiver Advocate",
    "bio": "Remington Rhodes is a Los Angeles–based artist manager known for his work with singer-songwriter Harry Hudson. As Harry’s brother and caregiver during cancer treatment, he also gained firsthand experience navigating the challenges young patients and their families face. Remington has shared that perspective through End Well, joining conversations about gaps in care and the importance of support and human connection during serious illness.",
    "hasHeadshot": true,
    "headshotBytes": 660809,
    "headshotFile": "/2026-headshots/airtable-current/recBWr2jSjytnP63B.jpg"
  },
  {
    "recordId": "recaK87WLMxw46TZC",
    "name": "Dr. Corey J. Nigro",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "neuropsychologist, Psychologist Unplugged podcast",
    "organization": "",
    "title": "Clinical Neuropsychologist",
    "bio": "Dr. Corey J. Nigro, PsyD is a clinical neuropsychologist, educator, and host of the Psychology Unplugged podcast. He earned his doctorate in Clinical Neuropsychology from the Adler School of Professional Psychology following graduate training in clinical psychology at Roosevelt University, with advanced training in neuropsychological assessment and cognitive behavioral therapy.\n\nDr. Nigro is the founder and president of Inwardboundpsych, LLC, where his clinical work is centered on comprehensive neuropsychological and psychological assessment of children, adolescents, and adults across the lifespan. His practice encompasses a broad range of neurodevelopmental, psychiatric, cognitive, and personality-related conditions, with particular interests in differential diagnosis, complex psychopathology, and personality disorders in adolescents and adults.\n\nNeuropsychological assessment is central to Dr. Nigro’s clinical philosophy. He believes that when individuals present with complex cognitive, emotional, behavioral, developmental, or psychiatric concerns, accurate diagnosis and a comprehensive understanding of the individual should precede treatment whenever possible. Rather than viewing testing simply as a means of assigning a diagnosis, Dr. Nigro approaches neuropsychological assessment as a process for understanding the whole person—including the interaction among cognition, emotion, personality, development, behavior, relationships, and life experience.\n\nThis approach is particularly important when symptoms overlap across diagnostic categories or when an individual has struggled despite previous treatment. A comprehensive neuropsychological evaluation can help clarify not only what difficulties are present, but also why they may be occurring and how they affect an individual’s functioning. Dr. Nigro believes that this level of diagnostic clarity can provide a more meaningful foundation for evidence-based treatment, educational planning, medication decisions, and long-term care.\n\nDr. Nigro has taught psychology and neuropsychology at the undergraduate, graduate, doctoral, and postdoctoral levels and has contributed to professional literature addressing psychological assessment and the development of personality pathology. His longstanding clinical and academic interests include neuropsychological and personality assessment, cognitive behavioral therapy, personality disorders, developmental psychopathology, differential diagnosis, and the relationship between brain functioning and behavior.\n\nDr. Nigro created the Psychology Unplugged podcast as an extension of this clinical and educational mission. From its inception, the goals of the podcast have been to legitimize conversations about psychopathology, destigmatize mental illness, and provide a realistic sense of hope to individuals and families struggling with psychological disorders. Rather than minimizing the seriousness or complexity of mental illness, Psychology Unplugged seeks to discuss it candidly, compassionately, and through the lens of psychological science.\n\nThrough conversations about psychology, psychiatry, personality, neuropsychology, mental health, philosophy, and human behavior, Dr. Nigro works to make complex psychological concepts accessible without oversimplifying them. He is particularly committed to challenging misinformation, casual self-diagnosis, and the reduction of complex psychological disorders to labels or social-media trends.\n\nAcross his clinical work, teaching, and podcast, Dr. Nigro’s overarching philosophy is that people are more complex than their diagnoses. Through careful assessment, evidence-based treatment, education, and honest conversation, he seeks to help individuals and families better understand psychological difficulties while maintaining a realistic sense of hope for meaningful change.",
    "hasHeadshot": true,
    "headshotBytes": 306704,
    "headshotFile": "/2026-headshots/airtable-current/recaK87WLMxw46TZC.jpg"
  },
  {
    "recordId": "recEZUTCUGANKByLl",
    "name": "Beth Kojima",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "Drug in Pocket",
    "organization": "",
    "title": "Founder, GTY Productions",
    "bio": "Beth Kojima is a co-founder of GTY Productions, a full-service production company that brings together innovators in sports, fashion, finance, pop culture, politics, and the arts. Beth began her career at Goldman Sachs, working in the Investment Management and Investment Banking Divisions. Beth subsequently worked at a hedge fund, TPG-Axon Capital, as the Partner in charge of Investor Relations and Strategy. Beth went on to Co-Found an ongoing education concept, Never Stop Learning (NSL), and subsequently worked on Ray McGuire’s mayoral campaign in New York City as the Director of Strategic Partnerships, running content for the campaign. Beth graduated from Duke University, magna cum laude, and received her MBA, beta gamma sigma, from Columbia Business School. Beth serves as a Trustee of the New York Public Library, The Johns Hopkins Hospital, The Chapin School, and she serves on the Women’s Board of the Boys Club of New York (BCNY). Beth also sits on the Board of Visitors for the Sanford School of Public Policy at Duke University, and is a member of the Dean’s Emeriti Circle for Trinity College at Duke University. Beth grew up in Baltimore, and currently lives in New York City with her husband and four children.",
    "hasHeadshot": true,
    "headshotBytes": 51064,
    "headshotFile": "/2026-headshots/airtable-current/recEZUTCUGANKByLl.jpg"
  },
  {
    "recordId": "recF45shNSaP9wTPo",
    "name": "Jennifer Donnelly",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "CEO Ultimate Matchmaker",
    "organization": "",
    "title": "The Ultimate Matchmaker",
    "bio": "Jennifer Donnelly is a Dallas-based entrepreneur and relationship expert known as The Ultimate Matchmaker. With more than two decades of experience, she helps executives, entrepreneurs, and public figures build lasting relationships through a personalized, discreet approach. Her work has been featured in Forbes, ELLE, and D Magazine. Jennifer emphasizes self-awareness, shared values, and emotional compatibility, helping clients understand both the partner they hope to find and the qualities they bring to a relationship.",
    "hasHeadshot": true,
    "headshotBytes": 332958,
    "headshotFile": "/2026-headshots/airtable-current/recF45shNSaP9wTPo.jpg"
  },
  {
    "recordId": "recjw3G877H0zk1Mb",
    "name": "Theresa Magnus",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Photographer",
    "organization": "",
    "title": "Talent Manager & Digital Creator",
    "bio": "Theresa Magnus is a talent manager and digital creator known for helping guide the career of her son, entertainer Gavin Magnus. Her work includes supporting his development as a performer and appearing across his social media channels. Through her involvement in his career, Theresa brings experience in digital entertainment and supporting young talent.",
    "hasHeadshot": true,
    "headshotBytes": 404239,
    "headshotFile": "/2026-headshots/airtable-current/recjw3G877H0zk1Mb.jpg"
  },
  {
    "recordId": "recEXWEcIC8i5DD9e",
    "name": "Hayden Harveston",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Son - Jennifer Donnaly",
    "organization": "",
    "title": "The Ultimate Matchmaker",
    "bio": "Hayden Harveston is a member of The Ultimate Matchmaker team, supporting its work in helping people build meaningful relationships. Hayden joins the Not Alone Summit alongside the team for a gathering focused on mental health, connection, and community.",
    "hasHeadshot": true,
    "headshotBytes": 75298,
    "headshotFile": "/2026-headshots/airtable-current/recEXWEcIC8i5DD9e.jpg"
  },
  {
    "recordId": "recSFlPwhOVKxnUW0",
    "name": "Lauren Ann",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Assistant 1 - Jennifer Donnaly",
    "organization": "",
    "title": "Executive Assistant to the CEO & Founder, The Ultimate Matchmaker",
    "bio": "Lauren Ann serves as Executive Assistant to the CEO and Founder of The Ultimate Matchmaker, supporting executive operations and day-to-day coordination. Her work helps the leadership team advance the company’s mission of building meaningful relationships. She joins The Ultimate Matchmaker team at the Not Alone Summit, a gathering focused on mental health, human connection, and community.",
    "hasHeadshot": true,
    "headshotBytes": 704205,
    "headshotFile": "/2026-headshots/airtable-current/recSFlPwhOVKxnUW0.jpg"
  },
  {
    "recordId": "recmXRCfAyi4ygTuJ",
    "name": "Jayson Ainsworth",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Therapist - Jennifer Donnaly",
    "organization": "",
    "title": "The Ultimate Matchmaker",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recOG5titrdIE6Vqd",
    "name": "Valerie Sizemore",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "with Forest Blakk",
    "organization": "",
    "title": "Founder, 432 Entertainment",
    "bio": "Valerie Sizemore has spent more than 15 years in the entertainment industry and is the founder of 432 Entertainment, a boutique strategy and management firm for artists, founders, authors, and speakers shaping how the world thinks, feels, and leads. She is deeply interested in the inner life behind outward success, particularly the intersection of psychology, faith, leadership, and mental health, and how those forces shape not only what people create, but who they become while creating it.",
    "hasHeadshot": true,
    "headshotBytes": 596365,
    "headshotFile": "/2026-headshots/airtable-current/recOG5titrdIE6Vqd.jpg"
  },
  {
    "recordId": "recigJVmy5mQK68ip",
    "name": "Miguel Tyson",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent",
      "Philanthropist"
    ],
    "occupation": "Mike Tyson's son - Fight for Lives",
    "organization": "Fight For Lives",
    "title": "Miguel Lión",
    "bio": "Miguel Lión’s work has taken him from documenting the lives of children with albinism in Tanzania who are hunted for their body parts to leading operations in Thailand to help young girls escape trafficking. He is the Founder and CEO of Exodus, a media company with a mission to uncover extraordinary stories from across the world and use them as a catalyst for real impact. As Director of the Tyson Foundation, an organization he founded alongside his father, Mike Tyson, Miguel has partnered with some of the world’s largest organizations. He has spearheaded projects such as the development of a school in Kenya and a theatre program for former gang members in Los Angeles. From documentaries to animation, Miguel believes stories can do so much more than just entertain—they can create opportunity, bridge diverse perspectives, and serve as one of the most powerful tools to create lasting change.",
    "hasHeadshot": true,
    "headshotBytes": 1210520,
    "headshotFile": "/2026-headshots/airtable-current/recigJVmy5mQK68ip.jpg"
  },
  {
    "recordId": "recP9QQsAum7S2XvQ",
    "name": "Alex Banayan",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Coming Alive Documentary",
    "organization": "Coming Alive Documentary",
    "title": "Filmmaker",
    "bio": "Alex Banayan is an international bestselling author and the director of the forthcoming feature documentary investigating the underlying causes of the youth mental health crisis and searching for a solution that is accessible, scalable, and free. The film's mission is to make connection, healing, and mental wellbeing more accessible to millions of young people around the world. Banayan has been featured in Fortune, Forbes, CNBC, Businessweek, The Washington Post, MSNBC, Fox News, and NBC News. A renowned keynote speaker, Banayan presents regularly to conferences and corporate leadership teams around the globe, including Apple, Google, Nike, IBM, Delta Airlines, Bank of America, Mastercard, and Disney.",
    "hasHeadshot": true,
    "headshotBytes": 40614,
    "headshotFile": "/2026-headshots/portraits/alex-banayan-c.jpg"
  },
  {
    "recordId": "reccVqPyo6sSOCHXY",
    "name": "Basak Kizilisik",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Alana Springsteen manager",
    "organization": "",
    "title": "Founder & CEO, Eighteen Company",
    "bio": "Basak Kizilisik is a Nashville-based music executive and founder of Eighteen Company, an artist management and entertainment consulting firm. Born in Turkey, she has built a career in artist development and marketing, creating campaigns for artists including George Strait, Kenny Chesney, Kacey Musgraves, and Old Dominion. As Alana Springsteen’s manager, she brings experience across record labels, digital strategy, and management to helping artists develop their careers and connect with audiences.",
    "hasHeadshot": true,
    "headshotBytes": 440895,
    "headshotFile": "/2026-headshots/airtable-current/reccVqPyo6sSOCHXY.jpg"
  },
  {
    "recordId": "rec1hznvSUlaXS2oT",
    "name": "Cole Higgins",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Gavin Magnus Guest",
    "organization": "",
    "title": "Co-Host, Bro Code Podcast",
    "bio": "Cole Higgins is a podcast personality and co-host of Bro Code Podcast alongside Gavin Magnus. The show features conversations about friendship, relationships, and life in the entertainment industry, with guests including artists and digital creators. Cole joins the Not Alone Summit as Gavin’s guest, participating in a gathering centered on mental health and human connection.",
    "hasHeadshot": true,
    "headshotBytes": 858442,
    "headshotFile": "/2026-headshots/airtable-current/rec1hznvSUlaXS2oT.jpg"
  },
  {
    "recordId": "recx4RAHLJgUlJhLy",
    "name": "Julie Catineau",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Wife of Dr Corey",
    "organization": "",
    "title": "Psychiatric-Mental Health Nurse Practitioner",
    "bio": "Julie Catineau, PMHNP-BC, is a board-certified psychiatric-mental health nurse practitioner who helps lead InwardBoundPsych in Massachusetts alongside Dr. Corey J. Nigro. The practice provides psychological and neuropsychological evaluations, medication treatment, and therapy. Through her work, Julie supports a collaborative approach to understanding patients’ needs and providing individualized mental health care.",
    "hasHeadshot": true,
    "headshotBytes": 2304606,
    "headshotFile": "/2026-headshots/airtable-current/recx4RAHLJgUlJhLy.jpg"
  },
  {
    "recordId": "recd0rZxWlI8cCjWa",
    "name": "Blake Bonner",
    "status": "Withdrew",
    "groups": [],
    "occupation": "Heaven's 27",
    "organization": "",
    "title": "Partner, Trive Capital & Co-Founder, Lila’s Light",
    "bio": "Blake Bonner is a partner at Trive Capital, where he evaluates investments and works with management teams on business growth and operations. A Texas Christian University graduate, he previously held roles at Insight Equity and Houlihan Lokey. Alongside his wife, Caitlin, he established Lila’s Light in memory of their daughter, honoring her love for animals through a foundation dedicated to animal rescue.",
    "hasHeadshot": true,
    "headshotBytes": 1315832,
    "headshotFile": "/2026-headshots/airtable-current/recd0rZxWlI8cCjWa.jpg"
  },
  {
    "recordId": "reclFa10z9bu1Txxa",
    "name": "Caitlin Bonner",
    "status": "Declined",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Heaven's 27",
    "organization": "",
    "title": "Co-Founder, Lila’s Light",
    "bio": "Caitlin Bonner co-founded Lila’s Light with her husband, Blake, in memory of their daughter, Lila. Created to honor Lila’s love for animals and animal rescue, the foundation carries forward her caring spirit. Through this work, Caitlin helps preserve her daughter’s legacy by supporting a cause that was close to Lila’s heart.",
    "hasHeadshot": true,
    "headshotBytes": 249146,
    "headshotFile": "/2026-headshots/airtable-current/reclFa10z9bu1Txxa.jpg"
  },
  {
    "recordId": "recyLKAm5rit5l86Q",
    "name": "Megan Haley",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "marriage and family therapist",
    "organization": "",
    "title": "Marriage & Family Therapist (LMFT)",
    "bio": "Megan Haley, LMFT, is a therapist, speaker, and debut author who serves on the advisory board of the Inspiring Children Foundation. Her debut book, Still Not Enough, co-authored with Dr. Blaise Aguirre, is forthcoming from Wiley in 2027. It explores the hidden psychological costs of high achievement and how to build a more sustainable relationship with success.\n\nMegan’s clinical work is centered in her private practice, where she works with adolescents, adults, and families. Her clinical background also includes treatment centers, schools, and mental health clinics. Her work focuses on anxiety, addiction, trauma, and relationship challenges. Megan also has a coaching practice, through which she has worked with a diverse range of clients, from public company CEOs to creatives in the entertainment industry. She earned her master’s degree in clinical psychology and draws on both her professional training and her own experience with healing.\n\nMegan is particularly passionate about working with adolescents and their caregivers as they navigate the complex physical, emotional, and behavioral changes of adolescence. Having worked extensively with teens in a variety of settings, she has a unique ability to connect with them and help them feel seen, understood, and spoken to in their own language. She is especially passionate about helping teen girls connect with their own deepest desires and aspirations, rather than those imposed by society.",
    "hasHeadshot": true,
    "headshotBytes": 116815,
    "headshotFile": "/2026-headshots/airtable-current/recyLKAm5rit5l86Q.jpg"
  },
  {
    "recordId": "reci6PAY1AHRJzpP1",
    "name": "Rohan Thakkar",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Hugz",
    "organization": "Hugz",
    "title": "Co-Founder, Hugz",
    "bio": "Rohan Thakkar is a co-founder of Hugz, the weighted stuffed-animal brand built alongside creator Lexi Hensler to bring comfort and support mental health awareness. His work includes financial planning and hands-on creative production, from photographing products to editing brand imagery. Rohan helps balance the company’s charitable mission with building a sustainable business.",
    "hasHeadshot": true,
    "headshotBytes": 52365,
    "headshotFile": "/2026-headshots/portraits/rohan-thakkar-c.jpg"
  },
  {
    "recordId": "recYAPVbxJzhFVgGm",
    "name": "Alyson Niemann",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Mindful Philanthropy",
    "organization": "",
    "title": "CEO, Mindful Philanthropy",
    "bio": "As a seasoned leader and strategic innovator in the nonprofit and philanthropic sectors, Alyson has dedicated over 25 years to driving meaningful impact on critical social issues. Her global leadership, including eight years focused on impactful initiatives in Russia, has strengthened organizations’ capacity to address pressing challenges and promote lasting social change.\n\nAlyson’s expertise spans the development and implementation of nonprofit programs targeting complex social issues, strategic planning for sustainable impact, financial stewardship, executive management, public speaking, and building effective leadership teams. Her strategic vision empowers organizations and their teams to drive real, positive change.\n\nSince joining Mindful Philanthropy in September 2020 as Chief Operating Officer, Alyson has built robust internal systems to enhance talent management, strategic planning, financial transparency, and effective communications. In 2021, she became Chief Executive Officer, where she continues to lead the organization in mobilizing high-impact funding to address urgent mental health and related social issues.\n\nAlyson holds a Bachelor of Business Administration from the Price School of Business at the University of Oklahoma and a Master of Public Administration from NYU’s Robert F. Wagner School of Public Service, where she also serves as an adjunct professor teaching nonprofit management. Her commitment to nurturing the next generation of leaders and advancing social change remains at the heart of her work.",
    "hasHeadshot": true,
    "headshotBytes": 1220299,
    "headshotFile": "/2026-headshots/portraits/alyson-niemann-c.jpg"
  },
  {
    "recordId": "recq5NWbdga6lNHfJ",
    "name": "Zephan Jones",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Silas Luke Jones Brother",
    "organization": "",
    "title": "Pianist",
    "bio": "Zephan Jones is a young pianist who performs alongside his brother, guitarist Silas Luke Jones. Billed as Zephan Joseph in a Porcupine Theater performance announcement, he joins Silas on piano for a musical collaboration combining guitar and keyboard. Their performances bring the brothers’ individual musical talents together onstage.",
    "hasHeadshot": true,
    "headshotBytes": 373745,
    "headshotFile": "/2026-headshots/airtable-current/recq5NWbdga6lNHfJ.jpg"
  },
  {
    "recordId": "recCxRbBa2BG4r6uk",
    "name": "Billy Jones",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Silas Luke Jones Father",
    "organization": "",
    "title": "Co-Owner, AK Diamond J Ranch & Father of Silas Luke and Zephan Jones",
    "bio": "Billy Jones co-owns AK Diamond J Ranch, a family-run wedding and event venue near Homer, Alaska, alongside his wife, Stephanie. Located on their family ranch and peony farm, the venue reflects their Alaskan heritage and family’s homesteading roots. Billy is also the proud father of guitarist Silas Luke Jones and pianist Zephan Jones, encouraging their musical pursuits and celebrating milestones including Silas’s appearance on America’s Got Talent.",
    "hasHeadshot": true,
    "headshotBytes": 31707,
    "headshotFile": "/2026-headshots/airtable-current/recCxRbBa2BG4r6uk.jpg"
  },
  {
    "recordId": "reclFsF1jwJ257cYw",
    "name": "Andrew Lane",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Gavin Magnus Manager",
    "organization": "",
    "title": "Music Producer & Songwriter",
    "bio": "Andrew Lane is a music producer and songwriter whose work spans pop, hip-hop, and R&B. Through his company, Drew Right Music, he has helped develop emerging artists, including Gavin Magnus. His career combines songwriting, production, and artist development, supporting performers as they shape their sound and build their recording careers.",
    "hasHeadshot": true,
    "headshotBytes": 207250,
    "headshotFile": "/2026-headshots/airtable-current/reclFsF1jwJ257cYw.jpg"
  },
  {
    "recordId": "recoAnxKTPkIYm3BQ",
    "name": "Robert Goldstein",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Karena Dawn Husband,",
    "organization": "",
    "title": "Podcast Producer & Founding Partner, The Big Silence",
    "bio": "Robert “Bobby” Goldstein, also known publicly as Bobby Gold, is Karena Dawn’s husband and a credited producer of The Big Silence podcast. He also joins Karena on the show for conversations about relationships, personal growth, and mental well-being. Their discussions explore navigating challenges as a couple, embracing change, and taking steps toward mental health support.",
    "hasHeadshot": true,
    "headshotBytes": 479288,
    "headshotFile": "/2026-headshots/airtable-current/recoAnxKTPkIYm3BQ.jpg"
  },
  {
    "recordId": "recrwbdOf4vhL1CJR",
    "name": "Landon Jacobs",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Bishop Husband",
    "organization": "",
    "title": "Singer-Songwriter & Co-Founder, Sir Sly",
    "bio": "Landon Jacobs is a California-based singer-songwriter and co-founder of the alternative band Sir Sly, known for songs including “Gold” and “High.” His music blends alternative pop and electronic influences with personal storytelling about anxiety, identity, and self-discovery. He is also the husband of singer-songwriter Bishop Briggs.",
    "hasHeadshot": true,
    "headshotBytes": 95003,
    "headshotFile": "/2026-headshots/airtable-current/recrwbdOf4vhL1CJR.jpg"
  },
  {
    "recordId": "recpeIqP2W2I34zS3",
    "name": "Tasha Rasolkhani-Kalhorn",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Clinical Psychologist",
    "bio": "Dr. Kalhorn has dedicated the last 15 years to serving our Active-Duty Service Members (ADSMs) at Evans Army Community Hospital at Fort Carson as the Chief of Intensive Outpatient Program. With specialties in trauma and forensic psychology. She has a background in research and some of her peer reviewed publications include: “On the Neural Basis of EMDR Therapy: Insight From qEEG Studies.” and “ A Ten Year Review of Treating Active Duty Military Service Members in a Gold-Standard Western Region Military Intensive Outpatient Program.” Dr. Kalhorn brings a wealth of expertise and experience to her role, ensuring comprehensive and compassionate care for our patients.",
    "hasHeadshot": true,
    "headshotBytes": 92502,
    "headshotFile": "/2026-headshots/airtable-current/recpeIqP2W2I34zS3.jpg"
  },
  {
    "recordId": "recQUic83U4agGjHC",
    "name": "Ann Morris",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "NAMI Chief Communications & Marketing Officer",
    "organization": "NAMI",
    "title": "Co-Owner, Show Creators Studios",
    "bio": "Amanda Deacon is an entertainment and production professional who co-owns Show Creators Studios in Las Vegas alongside Ian Herrington. Drawing on her background as a performer, she helps bring creative projects to life through live events, virtual productions, and content creation. The studio provides space and production support for entertainers, speakers, and organizations.",
    "hasHeadshot": true,
    "headshotBytes": 152984,
    "headshotFile": "/2026-headshots/portraits/ann-morris-c.jpg"
  },
  {
    "recordId": "recj6ZhMRqy5dxln1",
    "name": "Courtney Joaquin",
    "status": "Confirmed Attendance",
    "groups": [
      "Vendor Representative"
    ],
    "occupation": "Body Balance System",
    "organization": "",
    "title": "Chief Marketing Officer, Body Balance System",
    "bio": "Courtney Joaquin is a marketing professional with Body Balance System, a Las Vegas–based wellness technology company. Her professional background includes brand marketing, events, and helping businesses connect with their audiences.",
    "hasHeadshot": true,
    "headshotBytes": 170601,
    "headshotFile": "/2026-headshots/airtable-current/recj6ZhMRqy5dxln1.jpg"
  },
  {
    "recordId": "recofKZobpFII7nzo",
    "name": "Christopher Moore",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "CFO",
    "organization": "",
    "title": "",
    "bio": "Christopher Moore is a finance executive and fractional CFO who has seen, from the inside, both how companies scale and how they fail. Over more than twenty years of financial leadership, including more than fifteen years building and leading finance functions at early-stage and growth-stage technology companies, he has advised the leadership teams of public and private companies on corporate finance, risk management, financial planning and analysis, data analytics, and process improvement.\n\nA seasoned startup veteran, Chris has three times been the first finance leader recruited to build the finance function of early-stage technology companies from the ground up, establishing the operating metrics, board reporting, and accounting systems on which investors and directors depend. His experience also includes service as CFO of a publicly traded technology holding company.\n\nMore recently, Chris has guided distressed companies through restructurings and refinancings, working alongside bankers and outside advisors to evaluate asset sale and wind-down alternatives. That experience has given him an unusually granular understanding of the decisions that determine whether a company survives a difficult period: how runway becomes overstated, how vendor obligations quietly accumulate, and how board conversations shift from strategy to survival too late. He now brings both a builder's and a restructuring advisor's perspective to his fractional practice. Partnering with the founders and leadership teams of early-stage companies, whether they are scaling with healthy cash flow or navigating a more uncertain stretch, he helps build the financial discipline that transforms early momentum into a durable enterprise.\n\nChris is a CFA Charterholder and a member of the CFA Society New York. He earned his undergraduate business degree from the University of Miami and his Master of Business Administration from the Yale School of Management.",
    "hasHeadshot": true,
    "headshotBytes": 394916,
    "headshotFile": "/2026-headshots/portraits/christopher-moore-c.jpg"
  },
  {
    "recordId": "recYnxFhyTjEV1NyJ",
    "name": "Lia Shelesh",
    "status": "Confirmed Attendance",
    "groups": [
      "B - talent"
    ],
    "occupation": "Press - Content Creator",
    "organization": "",
    "title": "Content Creator",
    "bio": "SSSniperWolf is a YouTube creator known for her reaction and gaming content. She has been creating videos for over a decade and has built a community of millions across social media.",
    "hasHeadshot": true,
    "headshotBytes": 824588,
    "headshotFile": "/2026-headshots/portraits/lia-shelesh-c.jpg"
  },
  {
    "recordId": "recqva7BghVo4Jpi8",
    "name": "John Ratcliff",
    "status": "Declined",
    "groups": [
      "Founder"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "rec9pj20E6wqsw3Nb",
    "name": "Aloe Blacc",
    "status": "Withdrew",
    "groups": [],
    "occupation": "Musician",
    "organization": "",
    "title": "Grammy-Nominated Singer-Songwriter",
    "bio": "Aloe Blacc is a Grammy-nominated singer, songwriter and producer known for the global hits “I Need a Dollar,” “The Man” and “Wake Me Up,” his collaboration with Avicii. Raised in Southern California by Panamanian parents, he began his career in the hip-hop duo Emanon before breaking through as a solo artist with the albums Good Things and Lift Your Spirit. His music blends soul, folk, R&B and pop.",
    "hasHeadshot": false,
    "headshotFile": "/2026-headshots/portraits/aloe-blacc-c.jpg"
  },
  {
    "recordId": "rec1yt3GbxKRxV5YL",
    "name": "Dr. Shashita Inamdar",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Achieve Concierge Mental Health",
    "organization": "",
    "title": "Child, Adolescent & Adult Psychiatrist",
    "bio": "Dr. Shashita Inamdar is a board-certified psychiatrist and neuropharmacologist with more than 20 years of clinical experience. Based in Southern California, she specializes in understanding and treating mental health conditions across the lifespan. Her approach combines individualized care, therapy, medication when appropriate, and treatments such as transcranial magnetic stimulation. With a doctorate in neuropharmacology from UC San Diego, she brings both scientific expertise and a whole-person perspective to helping individuals and families.",
    "hasHeadshot": true,
    "headshotBytes": 185312,
    "headshotFile": "/2026-headshots/airtable-current/rec1yt3GbxKRxV5YL.jpg"
  },
  {
    "recordId": "recH7aNy5IiCThZgE",
    "name": "Bishop Briggs Guitarist",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Bishop Briggs Guitarist",
    "organization": "",
    "title": "Singer-Songwriter, Guitarist & Producer",
    "bio": "Taylor Van Ginkel is a California-based musician who writes and performs as Teenage Priest. His music blends indie pop, electronic textures, and guitar-driven melodies with personal storytelling. Through projects including Rhymes & Rhythms and Tails, he brings together his work as a songwriter, producer, and performer.",
    "hasHeadshot": true,
    "headshotBytes": 307411,
    "headshotFile": "/2026-headshots/airtable-current/recH7aNy5IiCThZgE.jpg"
  },
  {
    "recordId": "recqhCuuil87qZAt4",
    "name": "Bishop Briggs 2 Kids",
    "status": "Hold Space - 90%",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recIuhL5ZENjioBRK",
    "name": "Erica McGraw",
    "status": "Hold Space - 75%",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Philanthropist",
    "bio": "Erica McGraw is a philanthropist and former model who first became widely known as a member of the Dahm triplets. She later appeared on television, including Renovate My Family, where she met her husband, Jay McGraw. Today, Erica focuses primarily on her family and charitable interests and has supported initiatives centered on children, families, health and well-being.",
    "hasHeadshot": true,
    "headshotBytes": 250774,
    "headshotFile": "/2026-headshots/airtable-current/recIuhL5ZENjioBRK.jpg"
  },
  {
    "recordId": "recla3vMspedtrLv8",
    "name": "Jay McGraw",
    "status": "Hold Space - 75%",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "President & CEO, Stage 29 Productions; Emmy Award–Winning Executive Producer and Author",
    "bio": "Jay McGraw is an Emmy Award–winning television producer, entrepreneur and bestselling author. He serves as President and CEO of Stage 29 Productions and has created or executive-produced programs including The Doctors, Dr. Phil, The Test and several CBS primetime specials. Jay is also the co-founder and former chairman of the telehealth company Doctor On Demand and the author of six books focused largely on young people and families. He holds a psychology degree from the University of Texas at Austin and a law degree from Southern Methodist University",
    "hasHeadshot": true,
    "headshotBytes": 159960,
    "headshotFile": "/2026-headshots/airtable-current/recla3vMspedtrLv8.jpg"
  },
  {
    "recordId": "reciCrL5xe2t8Bjjp",
    "name": "Adam Lewis",
    "status": "Withdrew",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder & General Partner, Canyon Echo Capital",
    "bio": "Adam Lewis is an investor and philanthropist who co-founded Canyon Echo Capital, a multi-asset investment firm focused on initiatives that create positive social and environmental impact. Its investments span climate solutions, technology, human health, mental health and mindfulness. Alongside his wife, Melony, Adam supports philanthropic work in environmental protection, education, human rights and equality, mental health, and the arts.",
    "hasHeadshot": true,
    "headshotBytes": 194066,
    "headshotFile": "/2026-headshots/airtable-current/reciCrL5xe2t8Bjjp.jpg"
  },
  {
    "recordId": "recvL8Klkb0NQHOKx",
    "name": "Melony Lewis",
    "status": "Hold Space - 75%",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder and General Partner of Canyon Echo Capital",
    "bio": "Melony Lewis is the Co-Founder and General Partner of Canyon Echo Capital and leads her family foundation’s work supporting environmental protection, education, human rights and equality, mental health, and the arts. She serves as a trustee of the Aspen Institute and is actively involved with organizations throughout the Roaring Fork Valley. Melony has also supported documentary filmmaking as an executive producer and investor and has worked extensively in mindfulness and well-being. She earned her bachelor’s degree from the University of California, Santa Barbara.",
    "hasHeadshot": true,
    "headshotBytes": 299933,
    "headshotFile": "/2026-headshots/airtable-current/recvL8Klkb0NQHOKx.jpg"
  },
  {
    "recordId": "recWZqOFK1ZeWCkYH",
    "name": "Jeneva Bell",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "Ruggable",
    "title": "Founder & President, Ruggable",
    "bio": "Jeneva Bell is an entrepreneur, inventor and the founder of Ruggable, the home-furnishings company known for creating the first widely adopted two-piece, machine-washable rug system. Inspired by the everyday challenges of living with pets and children, she spent years developing and refining the product before growing Ruggable into an international brand with nearly 1,000 employees and manufacturing operations around the world. Her work combines innovative product design with a belief that beautiful homes should also be practical, comfortable and designed for real life.",
    "hasHeadshot": true,
    "headshotBytes": 175373,
    "headshotFile": "/2026-headshots/airtable-current/recWZqOFK1ZeWCkYH.jpg"
  },
  {
    "recordId": "rec4BvKnZvaZvGlCC",
    "name": "Geoff Ralston",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Former Yahoo exec",
    "organization": "",
    "title": "Entrepreneur, Investor & Former President of Y Combinator",
    "bio": "Geoff Ralston is a technology entrepreneur and investor who served as president of Y Combinator from 2019 to 2022, working with hundreds of startups throughout his time at the accelerator. Earlier in his career, he helped build Yahoo! Mail, served as Yahoo!’s chief product officer, and led Lala Media before its acquisition by Apple. He now leads the Safe Artificial Intelligence Fund, supporting startups working to make AI safer.",
    "hasHeadshot": true,
    "headshotBytes": 338422,
    "headshotFile": "/2026-headshots/airtable-current/rec4BvKnZvaZvGlCC.jpg"
  },
  {
    "recordId": "recwczI4XKw6rtade",
    "name": "Shayla Roland",
    "status": "Withdrew",
    "groups": [
      "X - attendee"
    ],
    "occupation": "NAMI Director of Partnerships",
    "organization": "NAMI",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recwlGUA83vOVocpp",
    "name": "Bob Bryan",
    "status": "Withdrew",
    "groups": [
      "A-Talent",
      "10"
    ],
    "occupation": "Tennis",
    "organization": "",
    "title": "Former Tennis Professional",
    "bio": "One of the most successful men’s doubles tennis players of all time, Bob Bryan has won 119 ATP doubles titles and 16 Grand Slams. Off the court, he is deeply committed to family life. His experience managing the demands of elite sport, world-class teamwork, and prolonged success gives him unique insight into how an individual pushes boundaries and how that model of dedication can translate at home.",
    "hasHeadshot": true,
    "headshotBytes": 487543,
    "headshotFile": "/2026-headshots/airtable-current/recwlGUA83vOVocpp.jpg"
  },
  {
    "recordId": "recuOxLcyzqcTmqlF",
    "name": "Mike Bryan",
    "status": "Withdrew",
    "groups": [
      "A-Talent",
      "10"
    ],
    "occupation": "Tennis",
    "organization": "",
    "title": "Former Tennis Professional",
    "bio": "Michael Carl “Mike” Bryan is an American former professional tennis player, widely regarded as one of the greatest doubles specialists in history. Alongside his twin brother Bob, he formed the Bryan Brothers, a partnership that won a record 124 ATP doubles titles, including 18 major men’s doubles trophies and 4 mixed doubles Grand Slams. The Bryan duo also achieved the Career Golden Slam, securing all four majors plus Olympic gold in 2012. After Bob’s injury, Mike continued competing with new partners and added titles, including the ATP Finals in 2018. He and Bob retired in 2020 and are jointly inducted into the class of 2025 for the International Tennis Hall of Fame.",
    "hasHeadshot": true,
    "headshotBytes": 17951,
    "headshotFile": "/2026-headshots/portraits/mike-bryan-2.jpg"
  },
  {
    "recordId": "recLjcZpOaSzCBZGz",
    "name": "Steven Cohen",
    "status": "Hold Space - 75%",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "Cohen Foundation",
    "title": "Owner, Chairman, and CEO of the New York Mets",
    "bio": "Steven A. Cohen is an investor, entrepreneur and philanthropist. He is the Chairman, CEO and Co-Chief Investment Officer of Point72, a global multi-strategy asset-management firm, and the Chairman and CEO of the New York Mets. Steven and his wife, Alexandra, founded the Steven & Alexandra Cohen Foundation in 2001, supporting mental health, veterans and their families, underserved communities, children, the arts, sustainability, and Lyme and tick-borne disease research. He also founded Cohen Veterans Network to expand access to high-quality mental healthcare for veterans, service members and their families.",
    "hasHeadshot": true,
    "headshotBytes": 281403,
    "headshotFile": "/2026-headshots/airtable-current/recLjcZpOaSzCBZGz.jpg"
  },
  {
    "recordId": "recNvZWmmFCG4EIYM",
    "name": "Alexandra Cohen",
    "status": "Withdrew",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "Cohen Foundation",
    "title": "Co-owner of the New York Mets",
    "bio": "Alexandra “Alex” Cohen is a philanthropist and community advocate who leads the Steven & Alexandra Cohen Foundation and the Amazin’ Mets Foundation, the philanthropic arm of the New York Mets. She directs giving toward underserved communities, children’s health and education, mental health and psychedelic research, Lyme and tick-borne diseases, the arts, and sustainability. Raised in New York City’s Washington Heights neighborhood, Alexandra is known for her hands-on approach to philanthropy and her commitment to strengthening communities through charitable giving, volunteerism and direct engagement.",
    "hasHeadshot": true,
    "headshotBytes": 597160,
    "headshotFile": "/2026-headshots/airtable-current/recNvZWmmFCG4EIYM.jpg"
  },
  {
    "recordId": "recdzSGvhKKSIHyLs",
    "name": "Logan Paul",
    "status": "Donation - Not Attending",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "",
    "title": "Entertainer, WWE Superstar & Co-Founder of PRIME",
    "bio": "Logan Paul is an entertainer, entrepreneur and WWE Superstar. A creator with tens of millions of followers, he co-founded the beverage company PRIME, hosts the Impaulsive podcast and has built a career that spans digital media, boxing and professional wrestling.",
    "hasHeadshot": true,
    "headshotBytes": 293468,
    "headshotFile": "/2026-headshots/portraits/logan-paul-c.jpg"
  },
  {
    "recordId": "recFTmtjrxaL2HbYm",
    "name": "Sheri Sobrato",
    "status": "Declined",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "",
    "organization": "Villa Bibbiani",
    "title": "Founder of Resonance Philanthropies",
    "bio": "Sheri is a member of the prominent Silicon Valley Sobrato family, known for their extensive real estate development and multi-generational philanthropy. At age 24, her life path shifted dramatically when she was diagnosed with a malignant brain tumor and told she might only have months to live. She underwent aggressive treatments that successfully saved her life. This personal battle gave her a deep sense of empathy for young patients, inspiring her decades-long mission to help families cope with the emotional and psychological trauma of serious illnesses.",
    "hasHeadshot": true,
    "headshotBytes": 285185,
    "headshotFile": "/2026-headshots/portraits/sheri-sobrato-c.jpg"
  },
  {
    "recordId": "reclXEhQPfoVeqdGO",
    "name": "Brian Hartwig",
    "status": "Declined",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "local-christiana-musk",
    "name": "Christiana Musk",
    "status": "Owner listed",
    "groups": [
      "Founder"
    ],
    "occupation": "",
    "organization": "Flourish Trust",
    "title": "Co-Founder, Flourish Trust",
    "bio": "",
    "hasHeadshot": true
  },
  {
    "recordId": "local-kimbal-musk",
    "name": "Kimbal Musk",
    "status": "Owner listed",
    "groups": [
      "Founder"
    ],
    "occupation": "",
    "organization": "The Kitchen Restaurant Group",
    "title": "Chairman, The Kitchen Restaurant Group, Square Roots and Big Green",
    "bio": "",
    "hasHeadshot": true
  },
  {
    "recordId": "local-george-rapier",
    "name": "Dr. George Rapier III",
    "status": "Owner listed",
    "groups": [
      "Founder"
    ],
    "occupation": "",
    "organization": "WellMed",
    "title": "Founder of WellMed & The Not Alone Dinner Series",
    "bio": "Dr. George M. Rapier III is an American physician, entrepreneur, and philanthropist based in Saint Thomas, U.S. Virgin Islands. Born and raised in Dallas, Texas, he earned his medical degree from the University of Florida before completing his postgraduate training at the University of Texas Health Science Center in San Antonio. In 1990, he founded WellMed Medical Management, which has since expanded into a leading primary care network serving Medicare patients across multiple states. His philosophy emphasizes proactive, preventive care rather than reactive treatment, especially for seniors. He also leads RapierMed, a consulting and investment firm focused on healthcare innovation and strategic partnerships. Throughout his career, he has held academic roles and received honors such as Physician Entrepreneur of the Year. Rapier is deeply involved in philanthropy, often working alongside his wife, Kym, through trusts and foundations that support education, senior care, homelessness prevention, and community health initiatives.",
    "hasHeadshot": true
  },
  {
    "recordId": "recsp9ukQoi7wHXFM",
    "name": "Kate Doerge",
    "status": "Confirmed Attendance",
    "groups": [
      "Expert",
      "F - talent"
    ],
    "occupation": "Grief expert",
    "organization": "",
    "title": "USA Today Bestselling Author",
    "bio": "Kate Doerge is a USA TODAY bestselling author, motivational speaker, certified grief coach, brand strategist, and nonprofit founder whose work centers on resilience, connection, purpose, and finding a way forward when life doesn’t go as planned.\n\nShe is the author of Reimagining Grief: A New Path to Finding Healing, Strength and Joy After Loss (Hay House), a deeply personal and actionable guide inspired by her own experiences with profound loss. Within six years, Kate lost her father to heart failure, her mother in a car accident, and, unimaginably, her 16-year-old daughter, Penny, to glioblastoma caused by neurofibromatosis (NF).\n\nRather than allowing loss to define what came next, Kate made a choice to move forward with purpose. She co-founded Penny’s Flight Foundation in honor of Penny to raise awareness and critical funding for NF research and to carry forward Penny’s legacy of joy, kindness, and positivity.\n\nToday, Kate brings her message to corporations, schools, wellness communities, and audiences across the country through keynotes, workshops, and conversations about navigating grief, adversity, change, and life’s unexpected challenges. Her work is grounded in a belief passed down from her father: We don’t choose the cards we’re dealt, but we do choose how we play them.\n\nAt the heart of everything Kate does is a simple philosophy: It’s not your lifespan that matters. It’s your wingspan—the impact you have on others while you’re here.",
    "hasHeadshot": true,
    "headshotBytes": 266240,
    "headshotFile": "/2026-headshots/portraits/kate-doerge-20261016.jpg"
  },
  {
    "recordId": "recEgb4HzUGo843bo",
    "name": "Blu Eyes",
    "status": "Confirmed Attendance",
    "groups": [
      "Musician"
    ],
    "occupation": "Musician",
    "organization": "",
    "title": "Singer-Songwriter & Performer",
    "bio": "BLÜ EYES is a Los Angeles–based alt-pop artist, songwriter, and producer known for transforming raw emotion into cinematic, deeply resonant pop. Self-produced and unapologetically honest, her music explores mental health, identity, healing, and the emotional contradictions of being human.\n\nThrough songs like “Dear Anxiety,” “Bad Feelings,” “Gaslight,” and “Two People at Once,” she has built a deeply connected community around vulnerability and the belief that music can help people feel seen, understood, and less alone. Her debut album, Two People at Once, examines the tension between joy and trauma, strength and fragility, and the reality that healing is rarely linear.\n\nWith more than 150 million global streams, BLÜ EYES has shared stages with JP Saxe, Rachel Platten, Alec Benjamin, Hunter Hayes, and Ingrid Andress, and has earned recognition from Zane Lowe, SiriusXM, and TikTok. Her ability to turn vulnerability into connection has established her as one of the most compelling emerging voices in emotionally honest pop.",
    "hasHeadshot": true,
    "headshotBytes": 1564942,
    "headshotFile": "/2026-headshots/airtable-current/recEgb4HzUGo843bo.jpg"
  },
  {
    "recordId": "recscpFoAZnCCcFIS",
    "name": "Christina Steil",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "Sarah Steil - Mother",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recnHos23LByx9hZS",
    "name": "Franco Pascali",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent"
    ],
    "occupation": "Magician",
    "organization": "",
    "title": "Magician & Mentalist",
    "bio": "Franco Pascali is a Los Angeles-based magician and mentalist known for close-up magic, sleight of hand, and cardistry. A theory11 artist, he has starred in The Magic Show at the Hollywood Roosevelt. Inspired by magic as a child, he joined the Magic Castle at 15 and developed a performance style centered on intricate card handling and intimate audience experiences.",
    "hasHeadshot": true,
    "headshotBytes": 291680,
    "headshotFile": "/2026-headshots/airtable-current/recnHos23LByx9hZS.jpg"
  },
  {
    "recordId": "recZFpRQrli2bcLUJ",
    "name": "Alex Accetta",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Alex Accetta, EdD, CEO",
    "organization": "",
    "title": "CEO, First Descents",
    "bio": "Alex Accetta, EdD, has spent his career exploring one enduring question: how do we help young adults find belonging and counter the loneliness that can keep them from fully engaging in their lives?\n\nAs CEO of First Descents, Alex helps young adults impacted by cancer and MS find community through adventure, nature, trauma-informed peer connection, and whole-person well-being. The organization’s work reflects a belief that shared experiences, challenge, and meaningful connection can help people reclaim a sense of belonging and agency during some of life’s most isolating moments.\n\nThat work has deep roots for Alex. As an NCAA athlete and captain at Stanford University, he began studying how identity, stereotypes, and belonging shape the way young adults experience themselves and one another. He later returned to Stanford to lead university-wide recreation and wellness initiatives, using movement, play, adventure, and learning to help create a more connected campus community. He and his wife also served as Resident Fellows, living in community with students and learning firsthand about their challenges with belonging and loneliness.\n\nAt Portland State University, Alex led campus life and helped create a first-of-its-kind recreation center designed around universal inclusion, expanding opportunities for students across physical, social, and neurological differences. His doctoral research further explored empathy and global perspective through sport, asking how experiences can help people better understand themselves in the world and develop the agency to act within it.\n\nAcross more than 50 talks and courses, Alex’s work has continued to explore the relationship between belonging, movement, empathy, and human connection. He has also coached collegiate athletes, taught skiing, served as president of Oregon Disabled Sports, completed the Leadville 100 mountain bike race, and has a forthcoming book in Japan examining Stanford's commitment to movement, and well-being.",
    "hasHeadshot": true,
    "headshotBytes": 699935,
    "headshotFile": "/2026-headshots/airtable-current/recZFpRQrli2bcLUJ.jpg"
  },
  {
    "recordId": "rechINwq0L8H2W7DP",
    "name": "Brian Hill",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "Superintendent of Schools - Mesa County Valley School District 51 in CO",
    "organization": "",
    "title": "Superintendent, Mesa County Valley School District 51",
    "bio": "Dr. Brian Hill serves as Superintendent of Mesa County Valley School District 51 (D51), the largest school district between Denver, Colorado, and Salt Lake City, Utah, serving 19,000 students across 40+ schools. Since his appointment in 2022, Dr. Hill has guided the district to historic academic achievement, including the highest graduation rate in district history and all schools performing at the state’s top academic levels. Under his leadership, D51 has expanded personalized learning, strengthened professional learning communities, deepened partnerships with families, local businesses, and higher education institutions, and has led the way for Colorado school districts in an effort to reduce smartphone distractions in schools through D51’s “More Social, Less Media” campaign. A recognized thought leader and Boettcher Foundation Doers & Difference Makers Fellow, Dr. Hill’s leadership is defined by innovation, access, opportunity, and collaboration, reflecting his commitment to engaging, equipping, and empowering every student for college, career, and life.",
    "hasHeadshot": true,
    "headshotBytes": 1627062,
    "headshotFile": "/2026-headshots/airtable-current/rechINwq0L8H2W7DP.jpg"
  },
  {
    "recordId": "recDuQALQ8uKnWKic",
    "name": "Heather Collins",
    "status": "Confirmed Attendance",
    "groups": [
      "Press"
    ],
    "occupation": "Press - Influencer - press covering awards show / RaisedInVegas",
    "organization": "Shorefire",
    "title": "Radio Personality & Digital Creator",
    "bio": "Heather Collins is a Las Vegas-born radio personality and digital creator who spent 16 years connecting with listeners at Mix 94.1. Known online as RadioHeather, she has built a career across broadcasting and social media. After leaving the station in September 2026, she continues her work as a creator with deep roots in the Las Vegas community.",
    "hasHeadshot": true,
    "headshotBytes": 330536,
    "headshotFile": "/2026-headshots/airtable-current/recDuQALQ8uKnWKic.jpg"
  },
  {
    "recordId": "rectG5lUfTRimZxos",
    "name": "Dana Moskowitz",
    "status": "Confirmed Attendance",
    "groups": [
      "Founder",
      "Philanthropist"
    ],
    "occupation": "Jeneva Bell's Guest",
    "organization": "",
    "title": "Guest of Jeneva Bell",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recegdc2xIEOIVRUZ",
    "name": "Abraham Kaoud",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent",
      "Musician"
    ],
    "occupation": "King Trot - Manager",
    "organization": "",
    "title": "Artist Manager, King Trot",
    "bio": "Abraham Kaoud is the manager of King Trot, supporting the artist’s professional career and representing his management team at the Not Alone Summit.",
    "hasHeadshot": true,
    "headshotBytes": 173834,
    "headshotFile": "/2026-headshots/airtable-current/recegdc2xIEOIVRUZ.jpg"
  },
  {
    "recordId": "recCJRF4bXr8lXf2T",
    "name": "Keelan Leyser",
    "status": "Confirmed Attendance",
    "groups": [
      "Press"
    ],
    "occupation": "VegasNavigator Influencer",
    "organization": "",
    "title": "Digital Illusionist, Mentalist & Speaker",
    "bio": "Keelan Leyser is a British-born digital illusionist and speaker who combines magic with technology and psychology. A former British Magical Grand Prix Champion, he has performed in more than 60 countries and appeared on shows including Penn & Teller: Fool Us and Masters of Illusion. He also co-authored Unseen, exploring perception, attention, and the blind spots that shape everyday decisions.",
    "hasHeadshot": true,
    "headshotBytes": 229736,
    "headshotFile": "/2026-headshots/airtable-current/recCJRF4bXr8lXf2T.jpg"
  },
  {
    "recordId": "recTBK1UPlEQin11H",
    "name": "Angela Leyser",
    "status": "Confirmed Attendance",
    "groups": [
      "Press"
    ],
    "occupation": "VegasNavigator Influencer",
    "organization": "",
    "title": "Influencer & Digital Creator",
    "bio": "Angela Leyser is an influencer and digital creator, and the wife of magician and digital illusionist Keelan Leyser. She joins Keelan at the Not Alone Summit.",
    "hasHeadshot": true,
    "headshotBytes": 156725,
    "headshotFile": "/2026-headshots/airtable-current/recTBK1UPlEQin11H.jpg"
  },
  {
    "recordId": "rec0JxGvxi4QsmfQz",
    "name": "Amber Ramirez",
    "status": "Confirmed Attendance",
    "groups": [
      "Press"
    ],
    "occupation": "Amberallurestyle Influencer",
    "organization": "",
    "title": "Lifestyle Content Creator, AmberAllureStyle",
    "bio": "Amber Ramirez is a Las Vegas–based lifestyle creator known online as @amberallurestyle. Her content covers home décor, beauty, food, and everyday life, including local dining discoveries and experiences around Las Vegas.",
    "hasHeadshot": true,
    "headshotBytes": 275895,
    "headshotFile": "/2026-headshots/airtable-current/rec0JxGvxi4QsmfQz.jpg"
  },
  {
    "recordId": "recoLAqCdcKrJj8WP",
    "name": "George Halawa",
    "status": "Confirmed Attendance",
    "groups": [
      "Vendor Representative",
      "Talent Team"
    ],
    "occupation": "Vendor with Harry Hudson",
    "organization": "Hey, I'm Here For You",
    "title": "Singer-Songwriter",
    "bio": "Raised in Los Angeles, Hudson pursued music from a young age, releasing his first singles in 2013. At age 20, he was diagnosed with Stage 3 Hodgkin’s lymphoma, an experience that profoundly shaped his artistry. Following his recovery, Hudson signed with Roc Nation and released his debut album Yesterday’s Tomorrow Night in 2018, featuring the breakout single “Yellow Lights,” which reached Spotify’s U.S. Viral Top 10.",
    "hasHeadshot": true,
    "headshotBytes": 101246,
    "headshotFile": "/2026-headshots/airtable-current/recoLAqCdcKrJj8WP.jpg"
  },
  {
    "recordId": "recd6nLobFuWZ7VKE",
    "name": "Colin Young",
    "status": "Confirmed Attendance",
    "groups": [
      "Vendor Representative"
    ],
    "occupation": "Shiftwave, vendor staff",
    "organization": "Shiftwave",
    "title": "Human Performance & Wellness Professional | Shiftwave",
    "bio": "Colin Young is a Colorado-based human performance professional with Shiftwave. His background includes corporate wellness education and fitness programming, with contributions to EXOS and Men’s Journal. A former varsity baseball player at Willamette University, he now helps introduce Shiftwave’s technology through events and demonstrations for clinicians, industry professionals, and broader audiences.",
    "hasHeadshot": true,
    "headshotBytes": 1406278,
    "headshotFile": "/2026-headshots/airtable-current/recd6nLobFuWZ7VKE.jpg"
  },
  {
    "recordId": "rec3rU4O5pc4xNCcY",
    "name": "Phillip Haney",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Jewel's Tour Manager",
    "organization": "",
    "title": "Tour Manager | Jewel",
    "bio": "Philip Haney is Jewel’s tour manager, supporting the coordination and logistics behind her live performances. His role brings together the artist’s team and the practical details of touring, helping keep shows and travel running smoothly.",
    "hasHeadshot": true,
    "headshotBytes": 262775,
    "headshotFile": "/2026-headshots/airtable-current/rec3rU4O5pc4xNCcY.jpg"
  },
  {
    "recordId": "rech3bptpbJmdBBWO",
    "name": "Posner Tour Manager",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent Support Staff"
    ],
    "occupation": "Tour Manager",
    "organization": "",
    "title": "Tour Manager, Mike Posner",
    "bio": "Mike Posner is a Detroit-born singer-songwriter known for hits including “Cooler Than Me” and “I Took a Pill in Ibiza,” which earned a Grammy nomination for Song of the Year. Beyond music, he completed a walk across America in 2019 and summited Mount Everest in 2021. Through his music, speaking, and extraordinary personal challenges, Mike shares lessons in resilience, self-discovery, and finding purpose, encouraging others to embrace growth and live more intentionally.",
    "hasHeadshot": true,
    "headshotBytes": 229876,
    "headshotFile": "/2026-headshots/airtable-current/rech3bptpbJmdBBWO.jpg"
  },
  {
    "recordId": "recO66ps1ep6vEo7Y",
    "name": "Zak Levitt",
    "status": "Update Hotel",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "rec7tjHtB5ImStcae",
    "name": "Julie Scelfo",
    "status": "Hold Space - 51%",
    "groups": [],
    "occupation": "Founder, Mothers against media addiction",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recl3zzNeEy3DN9RT",
    "name": "Jill Hawley",
    "status": "Withdrew",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "rec040hHVZDKMRSPa",
    "name": "Jessica Ladd",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Founder, Callisto & Social Entrepreneur",
    "bio": "Jessica Ladd is a social entrepreneur and founder of Callisto, an organization that developed technology to help sexual assault survivors document their experiences and identify repeat perpetrators. Trained in public health, she previously founded Sexual Health Innovations and was named an Ashoka Fellow in 2018. Her work focuses on giving survivors greater control over how and when they report.",
    "hasHeadshot": true,
    "headshotBytes": 786869,
    "headshotFile": "/2026-headshots/airtable-current/rec040hHVZDKMRSPa.jpg"
  },
  {
    "recordId": "rec2JzProBxYFw7sx",
    "name": "Sheila Escovedo",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Queen of Percussion",
    "bio": "Sheila E., widely recognized as the \"Queen of Percussion,\" is a Grammy-winning musician, producer, author, philanthropist, and one of the most influential percussionists in modern music. Her groundbreaking career spans decades filled with significant achievements, including becoming the first female solo percussionist honored with a star on the Hollywood Walk of Fame. Growing up in a musical family in the Bay Area, she drew seminal influences from her father, the legendary Pete Escovedo, and her godfather, the iconic Tito Puente, blending Latin jazz with an eclectic mix of Motown and Bay Area sounds.\n\nHer extraordinary career has included collaborations and performances alongside icons such as Prince, Marvin Gaye, George Duke, Lionel Richie, Carlos Santana, Gloria Estefan, Ringo Starr, Beyoncé, and many others. As a solo artist, Sheila E. helped define a generation with timeless hits including \"The Glamorous Life\" and \"A Love Bizarre.\"\n\nBeyond her electrifying performances, Sheila E.'s influence extends into acting, philanthropy, mentorship, and education. As co-founder of Elevate Oakland, she continues her commitment to empowering underserved youth through music, arts, education, mentorship, and community engagement. She is also the author of the acclaimed autobiography, The Beat of My Own Drum.\n\nMost recently, Sheila E. expanded her artistic legacy with her Grammy-winning salsa album, Bailar, co-produced withTony Succar and featuring collaborations with Gloria Estefan, Rubén Blades, Gilberto Santa Rosa, Mimy Succar, and others. In 2025, she earned her first Grammy Award for Best Global Music Performance for \"Bemba Colorá,\"received the prestigious DW Lifetime Achievement Award at NAMM, and continues to perform for audiences worldwide, with recent appearances at Ronnie Scott's Jazz Club in London, Blue Note Los Angeles, Miami's Adrienne Arsht Center, and upcoming performances at the iconic Hollywood Bowl.\n\nBalancing life as a performer, producer, author, and philanthropic leader, Sheila E. continues to inspire audiences around the world through her dynamic artistry, cultural impact, and enduring musical legacy.",
    "hasHeadshot": true,
    "headshotBytes": 2479300,
    "headshotFile": "/2026-headshots/airtable-current/rec2JzProBxYFw7sx.jpg"
  },
  {
    "recordId": "rec4872W99ReQ3wEB",
    "name": "Yvette Baker",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Owner & Pilates Instructor, Y B Fit Pilates",
    "bio": "Yvette Baker is the owner and instructor behind Y B Fit Pilates in Las Vegas. With a background in movement and performance, she teaches private sessions and small group classes focused on strength, alignment, mobility, and body awareness. Her work includes helping dancers and athletes complement their training while supporting clients at a range of fitness levels.",
    "hasHeadshot": true,
    "headshotBytes": 197993,
    "headshotFile": "/2026-headshots/airtable-current/rec4872W99ReQ3wEB.jpg"
  },
  {
    "recordId": "rec5JB4TYptjEljdq",
    "name": "Dylan Aguilar",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Television Personality, Love on the Spectrum",
    "bio": "Dylan Aguilar is a Los Angeles–based television personality who joined the fourth season of Netflix’s Love on the Spectrum. A music and movie enthusiast, he shares his experiences navigating dating and making new connections. His appearance on the series offers viewers a personal perspective on the hopes, vulnerability, and excitement that come with looking for love.",
    "hasHeadshot": true,
    "headshotBytes": 175425,
    "headshotFile": "/2026-headshots/airtable-current/rec5JB4TYptjEljdq.jpg"
  },
  {
    "recordId": "rec6zx9NQ9OXJNzJa",
    "name": "Kelly Richardson",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Fitness Professional",
    "bio": "Originally from Colorado and now residing on California’s Central Coast, Kelly Richardson has built her career around a shared passion for movement, human connection, and inspiring others to thrive.\n\nKelly’s journey began as a professional dancer, training at Interlochen Arts Academy and Marymount Manhattan College before performing with dance and entertainment companies in Denver, New York City, and internationally. Her career expanded into the world of professional sports, where she managed entertainment and promotions for both the Colorado Rockies and Denver Broncos, creating experiences that brought people together through engaging opportunities, and a shared sense of community.\n\nWith over 15 years of experience in the health and fitness industry, Kelly has dedicated much of her career to helping others discover the transformative power of movement. She has held leadership positions as a Regional Manager for Wellbridge and Chuze Fitness and served as a Barre Master Trainer, mentoring and inspiring fellow fitness professionals.\n\nKelly holds nationally recognized group fitness certifications through the American Council on Exercise (ACE) and the Athletics and Fitness Association of America (AFAA), a personal training certification through the National Academy of Sports Medicine (NASM) and is a Yoga Alliance-certified yoga instructor. Today, she continues to share her passion through her athletic training and a variety of group fitness, pilates, and yoga classes.\n\nThroughout her career, Kelly has witnessed firsthand how movement, music, and meaningful human connection can positively impact both physical and emotional well-being. She believes fitness is much more than just physical strength—it builds confidence, supports mental health, reduces stress, and fosters meaningful connections both personally and with others.",
    "hasHeadshot": true,
    "headshotBytes": 2034117,
    "headshotFile": "/2026-headshots/airtable-current/rec6zx9NQ9OXJNzJa.jpg"
  },
  {
    "recordId": "rec8FnyoP4e9rUUD4",
    "name": "Stephanie Azurdia",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Guest of Dylan Aguilar",
    "bio": "Stephanie Azurdia is the cousin of Dylan Aguilar, who appears on Netflix’s Love on the Spectrum. Part of his close-knit family circle, she shares his enjoyment of movies, dining out, and spending time together. She joins the Not Alone Summit as his guest.",
    "hasHeadshot": false
  },
  {
    "recordId": "rec97E7jRL9ZlUYKa",
    "name": "Andrew Diehl",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Red Ventures Professional & Princeton Graduate",
    "bio": "Andrew Diehl is a business professional at Red Ventures and a Princeton University graduate. Originally from Wayne, Pennsylvania, he competed in high jump for Princeton, earning an NCAA Regional qualification and an Ivy League outdoor runner-up finish in 2019. His academic work examined how corruption affects business growth in developing countries, informed by two summers in the Dominican Republic.",
    "hasHeadshot": true,
    "headshotBytes": 136546,
    "headshotFile": "/2026-headshots/airtable-current/rec97E7jRL9ZlUYKa.jpg"
  },
  {
    "recordId": "rec9efT1YUzSwOQv7",
    "name": "Mackenzie Sol",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Singer & Performer",
    "bio": "Mackenzie Sol is a British singer and performer originally from County Durham, England. He reached the Top 24 on the 2024 season of American Idol, showcasing his voice through performances including Labrinth’s “Jealous.” His creative work spans music, acting, and digital entertainment.",
    "hasHeadshot": true,
    "headshotBytes": 269847,
    "headshotFile": "/2026-headshots/airtable-current/rec9efT1YUzSwOQv7.jpg"
  },
  {
    "recordId": "recBci6TydSBFxZVb",
    "name": "Yoli Mayor",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Singer-Songwriter",
    "bio": "Yoli Mayor is a Cuban-American singer-songwriter from Miami known for her powerful, soulful voice. She gained national recognition on America’s Got Talent after developing her craft in Miami’s live music community. Inspired by artists including Ella Fitzgerald, Nina Simone, and Etta James, she brings together soul influences and her Cuban-American roots.",
    "hasHeadshot": true,
    "headshotBytes": 121050,
    "headshotFile": "/2026-headshots/airtable-current/recBci6TydSBFxZVb.jpg"
  },
  {
    "recordId": "recDkSabceRTzLNoT",
    "name": "Alexander Roque",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "CEO, Ali Forney Center",
    "bio": "Alexander Roque is the CEO of the Ali Forney Center, a New York-based organization supporting LGBTQ+ young people experiencing homelessness. With more than 20 years in the nonprofit sector, his work spans fundraising, organizational development, and expanding access to services. He has helped grow the center’s capacity to provide housing, care, and pathways toward independence.",
    "hasHeadshot": true,
    "headshotBytes": 284646,
    "headshotFile": "/2026-headshots/airtable-current/recDkSabceRTzLNoT.jpg"
  },
  {
    "recordId": "recFg2EqNUcHpyqaB",
    "name": "Jordan Rose",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Founder & President, Rose Law Group",
    "bio": "Jordan Rose is an attorney and entrepreneur who founded Rose Law Group in Scottsdale, Arizona, in 2000, growing it into the largest woman-owned law firm in Arizona history. Her practice spans land use, zoning, government affairs, and business development. Recognized by The Business Journals as one of the nation’s top 100 Influencers in Law, Jordan also supports community organizations through board service with the Phoenix Art Museum, Barrow Neurological Institute, and the American Cancer Society’s CEOs Against Cancer.",
    "hasHeadshot": true,
    "headshotBytes": 266726,
    "headshotFile": "/2026-headshots/airtable-current/recFg2EqNUcHpyqaB.jpg"
  },
  {
    "recordId": "recHUe7yCx96KjyX2",
    "name": "Karen Niemi",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Executive Director, Yale Center for Emotional Intelligence",
    "bio": "Karen Niemi is the Executive Director at the Yale Center for Emotional Intelligence. With a distinguished career in the field of social and emotional learning (SEL), Karen has been instrumental in shaping the landscape of SEL both nationally and globally. Before joining the Center, she served as the President and CEO of the Collaborative for Academic, Social, and Emotional Learning (CASEL), where she played a pivotal role in establishing SEL as a critical component of education reform, enhancing CASEL’s operational strategies, and fostering impactful collaborations. Karen has been a key figure in expanding funding sources, diversifying revenue streams, and driving the financial and operational success of SEL initiatives.\n\nBefore assuming her position at CASEL, Niemi held diverse roles in the education and social-emotional learning sector, notably serving as a distinguished CEO and President for SEL and education publishing enterprises. Additionally, she garnered respect as an advisor to school districts, schools, educational publishing companies, and non-profit organizations. Niemi’s reputation as a catalyst for positive change in education precedes her, firmly establishing her as a trusted figure in advancing social and emotional learning initiatives. Karen’s favorite ways to recharge and maintain balance are through spending time with her family, yoga, and exploring the great outdoors, a passion that aligns with her commitment to holistic well-being and lifelong learning.",
    "hasHeadshot": true,
    "headshotBytes": 659768,
    "headshotFile": "/2026-headshots/airtable-current/recHUe7yCx96KjyX2.jpg"
  },
  {
    "recordId": "recJ0BZ7CUDIKF8hc",
    "name": "Super Crew",
    "status": "Confirmed Attendance",
    "groups": [
      "Talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recJyWZcN5di074T0",
    "name": "Kelly Angelini",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Guest of Achieve Concierge",
    "bio": "Kelly Angelini attends the Not Alone Summit as a guest of Achieve Concierge, joining the event’s community of attendees and mental health professionals.",
    "hasHeadshot": false
  },
  {
    "recordId": "recK2fBfXgVqIY5Ad",
    "name": "Ross Rocketto",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Chief Advocacy and Culture Change Officer at Equimundo",
    "bio": "Ross Morales Rocketto is the Chief Advocacy and Culture Change Officer at Equimundo, one of the world’s leading organizations working at the intersection of gender equity, masculinity, and social justice.\n\nRoss has over two decades of experience building and launching large-scale organizations and campaigns, and working in electoral politics, supporting candidates from school board to presidential level. He is the Founder and Executive Director of Man Made, a non-profit focused on building projects that support men’s wellbeing at scale, benefiting over 100 million men across the United States. Ross is also the President and CEO of Brick by Brick, a chain of gyms addressing social isolation among men by bringing them together into physical space. Ross combines this work with his role at Equimundo, strengthening their collective impact by changing the scripts around masculinity.\n\nIn 2017, Ross co-founded Run for Something, recruiting and supporting young people to run for political office. Ross served as the Co-Executive Director for eight years and, to date, the organization has recruited over 300,000 people across 50 states, supporting the election of almost 2,000 candidates across the United States. During the 2024 United States election cycle, Ross founded and led White Dudes for Harris, which engaged more than 300,000 participants, and raised $5 million for the Harris Walz Campaign. Ross was named to TIME's Next 100 list in 2022, receiving national recognition as an emerging leader shaping the future.\n\nRoss lives in Chicago, IL with his partner Jess, his two dogs Nacho and Pierogi, as well as his cat, Baby Kitty.",
    "hasHeadshot": true,
    "headshotBytes": 660693,
    "headshotFile": "/2026-headshots/airtable-current/recK2fBfXgVqIY5Ad.jpg"
  },
  {
    "recordId": "recMnrUM2qcLWIhbL",
    "name": "Anna Muller",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent",
      "Press"
    ],
    "occupation": "",
    "organization": "",
    "title": "Mental Health Influencer & Advocate",
    "bio": "Ana Muller is a mental health influencer and advocate who brings a focus on mental wellbeing to her online presence. She joins the Not Alone Summit as part of its community of creators and advocates.",
    "hasHeadshot": true,
    "headshotBytes": 247964,
    "headshotFile": "/2026-headshots/airtable-current/recMnrUM2qcLWIhbL.jpg"
  },
  {
    "recordId": "recNIfdEXMa1wnld2",
    "name": "Justice Shepard",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Educational Content Creator & Entrepreneur",
    "bio": "Justice Shepard is an educational creator and entrepreneur known online as @justicethetutor. Raised in San Jose, California, he earned an electrical engineering degree from UC Santa Barbara. Based in Los Angeles, he creates mathematics tutorials and educational courses while helping brands develop their social media presence.",
    "hasHeadshot": true,
    "headshotBytes": 216854,
    "headshotFile": "/2026-headshots/airtable-current/recNIfdEXMa1wnld2.jpg"
  },
  {
    "recordId": "recPZzrkSwp5GJzDe",
    "name": "Larry Mei",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder, Hugz",
    "bio": "Larry Mei is a co-founder of Hugz, the weighted stuffed-animal company created alongside Lexi Hensler and Rohan Thakkar. He has taken a full-time role in the business, helping build a brand that pairs comforting products with charitable giving. Hugz donates a portion of every purchase to mental health organizations.",
    "hasHeadshot": false
  },
  {
    "recordId": "recPcFRLBxAqRzyc5",
    "name": "TJ Farrell",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Manager, Alumni Relations & Community Projects, Philadelphia Phillies",
    "bio": "TJ Farrell joined the Phillies in March of 2014 and is entering his third season in his current role with the Alumni Relations and Community Projects department. In this position with the organization, TJ and the outreach team strive to connect the Phillies players, coaches, broadcasters, alumni, and front office members with the community through events and special projects. Additionally, TJ works closely with the team’s alumni and their families, ensuring the rich history of the Philadelphia Phillies organization continues to be showcased.\n\nBorn in Broomall, PA, TJ graduated from Villanova University with a degree in Communications and minors in Economics and Writing & Rhetoric. He obtained his graduate degree from West Chester University (PA.) in Business Administration. He and his wife, Kristina, reside in Havertown, PA.\n\nIn February 2021, TJ and the Phillies community team coordinated the inception of the organization’s mental health awareness program, “Strike Out the Stigma”. Once a program created out of necessity, Strike Out the Stigma has turned into the heartbeat of the organization’s philanthropic efforts to raise awareness and dismantle the stigma surrounding mental health. The program serves as a vital bridge between the Phillies organization and the mental health community.\n\nThe purpose of the Strike Out the Stigma program is to support individuals struggling with mental health challenges, bring important conversations to the forefront, educate families and support systems on crisis intervention, and honor the dedicated professionals working within the mental health industry.\n\nThe program focuses on raising vital awareness and funds for local non-profits, hosting meaningful, memorable events for participants, and providing necessary educational resources regarding mental health aid. Ultimately, the foundational mission of the program remains constant: to reinforce the message that mental health impacts everyone, and that you are “Never Fightin’ Alone”.",
    "hasHeadshot": true,
    "headshotBytes": 2140304,
    "headshotFile": "/2026-headshots/airtable-current/recPcFRLBxAqRzyc5.jpg"
  },
  {
    "recordId": "recSQtMbd6BTw3v9o",
    "name": "Jhone Ebert",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Superintendent, Clark County School District",
    "bio": "Jhone Ebert is superintendent of the Clark County School District and previously served as Nevada’s Superintendent of Public Instruction. A former mathematics teacher, she has led efforts to expand access to technology, strengthen college and career readiness, and improve school funding. Her honors include the Presidential Award for Excellence in Mathematics Teaching.",
    "hasHeadshot": true,
    "headshotBytes": 186728,
    "headshotFile": "/2026-headshots/airtable-current/recSQtMbd6BTw3v9o.jpg"
  },
  {
    "recordId": "recTr8Jw4jSSXQzCL",
    "name": "Carson Rose",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder, Atlys & Big League Wiffle Ball",
    "bio": "Carson Rose is one of the original founders of Big League Wiffle Ball, the world's first professional wiffle ball league, and serves as Chief Growth Officer of Wiffle Ball Inc., the manufacturer of the original WIFFLE ball and bat. He is also the co-founder of ATLYS, the first stainless steel sports bottle of its kind, which raised more than $150,000 in early-stage funding, sold out its entire first production run, and has accumulated over twenty million views in the three months since launch. The company is backed by more than ten professional athletes across the NFL, NBA, MLB, and NHL. Carson is a senior at Phoenix Country Day School in Paradise Valley, Arizona.",
    "hasHeadshot": true,
    "headshotBytes": 8951435,
    "headshotFile": "/2026-headshots/airtable-current/recTr8Jw4jSSXQzCL.jpg"
  },
  {
    "recordId": "recV0JfIIS6j1DCp5",
    "name": "Reid Umar",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Founder, Atlys & Student-Athlete",
    "bio": "Reid Umar serves as the Arizona Ambassador for the Inspiring Children Foundation and its Not Alone Challenge, an initiative dedicated to improving youth mental health. He is also the originator of the idea behind ATLYS and a co-founder of the company, which developed the first stainless steel sports bottle of its kind. Since its launch, ATLYS has raised more than $150,000 in private investment, generated over $60,000 in preorders, and accumulated more than twenty million views. The company is supported by professional athletes across the NFL, NBA, MLB, and NHL. Reid is currently a senior at Phoenix Country Day School in Paradise Valley, Arizona.",
    "hasHeadshot": true,
    "headshotBytes": 351081,
    "headshotFile": "/2026-headshots/airtable-current/recV0JfIIS6j1DCp5.jpg"
  },
  {
    "recordId": "recY0iuBozPDNmZOH",
    "name": "Mitchell J. Prinstein",
    "status": "Withdrew",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": true,
    "headshotBytes": 580886,
    "headshotFile": "/2026-headshots/airtable-current/recY0iuBozPDNmZOH.jpg"
  },
  {
    "recordId": "recaDgDHh2C4tMmNq",
    "name": "Kristin Hatcher",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Public Health Professional, The Fund to Prevent Sexual Assault",
    "bio": "Kristin Hatcher is a public health professional affiliated with The Fund to Prevent Sexual Assault, an initiative she helped develop alongside Jessica Ladd. Her background includes training at Johns Hopkins Bloomberg School of Public Health and published research on humanitarian health programs, surgical care access, and health equity.",
    "hasHeadshot": true,
    "headshotBytes": 1095162,
    "headshotFile": "/2026-headshots/airtable-current/recaDgDHh2C4tMmNq.jpg"
  },
  {
    "recordId": "reccP4UiifIIbJpPQ",
    "name": "Selena Williams",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Youth Mental Health Advocate, Inspiring Children Foundation",
    "bio": "Selena Williams is an Inspiring Children Foundation alumna who has served as co-chair of its Youth Advisory Board. She earned a Gates Scholarship to Brown University, where she studied computer science and played Division I tennis. Her experience includes robotics research and internships at Amazon Robotics, alongside her work mentoring young people and advocating for youth mental health.",
    "hasHeadshot": true,
    "headshotBytes": 97832,
    "headshotFile": "/2026-headshots/airtable-current/reccP4UiifIIbJpPQ.jpg"
  },
  {
    "recordId": "reccYQjPt7TNpk4AP",
    "name": "Douglas McKenzie",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Magician, Mentalist & Television Producer",
    "bio": "Doug McKenzie is a Scottish-born magician and mentalist known for blending technology with close-up magic. A longtime collaborator of David Blaine, he has consulted on and produced television specials and live performances. He holds a degree from NYU’s Stern School of Business and has performed internationally for entertainment and corporate audiences.",
    "hasHeadshot": true,
    "headshotBytes": 208046,
    "headshotFile": "/2026-headshots/airtable-current/reccYQjPt7TNpk4AP.jpg"
  },
  {
    "recordId": "recdgfoWNeqCQf0iU",
    "name": "Maryn Pierce",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Figure Skater | U.S. International Competitor",
    "bio": "Maryn Pierce is an American figure skater from Frisco, Texas, who began skating at age four. She has competed at the U.S. Championships and represented the United States on the Junior Grand Prix circuit. Her accomplishments include a junior bronze medal at the 2021 Cranberry Cup and a Southwestern Regional Challenge title.",
    "hasHeadshot": true,
    "headshotBytes": 2481151,
    "headshotFile": "/2026-headshots/airtable-current/recdgfoWNeqCQf0iU.jpg"
  },
  {
    "recordId": "receLk6EPZiyQliEE",
    "name": "Ia Cheveres",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Guest of Sheila E.",
    "bio": "Ia Cheveres joins the Not Alone Summit as a guest of renowned percussionist and recording artist Sheila E.",
    "hasHeadshot": true,
    "headshotBytes": 252836,
    "headshotFile": "/2026-headshots/airtable-current/receLk6EPZiyQliEE.jpg"
  },
  {
    "recordId": "rech2Y2rToKGdcvuR",
    "name": "Joanna Howard",
    "status": "Hold Space - 90%",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Executive Assistant to the CEO & Founder, The Ultimate Matchmaker",
    "bio": "Lauren Ann serves as Executive Assistant to the CEO and Founder of The Ultimate Matchmaker, supporting executive operations and day-to-day coordination. Her work helps the leadership team advance the company’s mission of building meaningful relationships. She joins The Ultimate Matchmaker team at the Not Alone Summit, a gathering focused on mental health, human connection, and community.",
    "hasHeadshot": true,
    "headshotBytes": 704205,
    "headshotFile": "/2026-headshots/airtable-current/rech2Y2rToKGdcvuR.jpg"
  },
  {
    "recordId": "rechK8GVDYbJCAWSX",
    "name": "Vadim Fridman",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Co-Trustee, Windsong Trust",
    "bio": "Vadim Fridman serves as co-trustee of Windsong Trust, a philanthropic foundation supporting charitable and educational initiatives. The trust’s funding has helped expand student access to the Museum of Tolerance and supported programs serving young people.",
    "hasHeadshot": true,
    "headshotBytes": 295894,
    "headshotFile": "/2026-headshots/airtable-current/rechK8GVDYbJCAWSX.jpg"
  },
  {
    "recordId": "rechf3ZLWkPuRj7zX",
    "name": "Julie Scelfo",
    "status": "Withdrew",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "reciu05MxS6ye5lXf",
    "name": "Izzy Houghton",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Grammy-Winning Gospel Artist & Worship Leader",
    "bio": "Israel Houghton is a GRAMMY-winning singer, songwriter, and worship leader whose music combines gospel, jazz, rock, and Latin influences. As the creative force behind Israel & New Breed, he has helped shape contemporary worship music for more than two decades, connecting audiences across cultures through faith and music.",
    "hasHeadshot": true,
    "headshotBytes": 357971,
    "headshotFile": "/2026-headshots/airtable-current/reciu05MxS6ye5lXf.jpg"
  },
  {
    "recordId": "recivkdGt03NZfS2Y",
    "name": "Shoaib Kabani",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Business Partner, Hugz",
    "bio": "Shoaib Kabani is a business partner at Hugz, working alongside its founders to develop a brand centered on comfort and mental health awareness. Known to the team as “Sho,” he helps guide collaborative decisions and keep the company’s growth aligned with its mission. Hugz combines weighted stuffed animals with support for mental health charities.",
    "hasHeadshot": true,
    "headshotBytes": 1222611,
    "headshotFile": "/2026-headshots/airtable-current/recivkdGt03NZfS2Y.jpg"
  },
  {
    "recordId": "recjdC3Wg6cLcksFd",
    "name": "Cameron Muller",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent",
      "Press"
    ],
    "occupation": "",
    "organization": "",
    "title": "Tennis Coach & Academy Director",
    "bio": "Cameron Muller is a former professionally ranked tennis player and academy director at West Hills Athletic Club in Michigan. Originally from Petoskey, he has coached leading junior players and touring professionals, including at Wimbledon, the French Open, and ATP and WTA events. His coaching emphasizes technique, discipline, and the mental side of competitive tennis.",
    "hasHeadshot": true,
    "headshotBytes": 56645,
    "headshotFile": "/2026-headshots/airtable-current/recjdC3Wg6cLcksFd.jpg"
  },
  {
    "recordId": "reckadaB6OqQcugwN",
    "name": "Priya Nakra",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Founder & Executive Director, Override Labs",
    "bio": "Priya Nakra is the founder and Executive Director of Override Labs, a nonprofit building prevention technology to reduce sexual violence and gender-based harm, online and off. Before founding Override Labs, Priya spent a decade leading product at Netflix, Nova Credit, and Blend. She builds ito (is this ok?), an anonymous AI tool where young people talk through sexual situations that felt off and get an honest read without shame. ito has been used in more than 1,000 sessions, and in studies with young men, 42% came away reading their situation more cautiously. She also builds tools for girls and young women, parents, and bystanders, plus AI scanning tools that helps developers find the ways their products can be misused to cause harm.",
    "hasHeadshot": true,
    "headshotBytes": 478651,
    "headshotFile": "/2026-headshots/airtable-current/reckadaB6OqQcugwN.jpg"
  },
  {
    "recordId": "reclRFyb7EOWg9fYQ",
    "name": "Gabriella Viveros",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Brand Experience & Events Professional, Hugz",
    "bio": "Gabriella Viveros is a member of the Hugz team with more than 13 years of experience creating events and experiences that bring people together. Her background includes creative agency work, brand activations, and event production. She brings that experience to Hugz, a weighted stuffed-animal brand built around comfort and mental health awareness.",
    "hasHeadshot": true,
    "headshotBytes": 110824,
    "headshotFile": "/2026-headshots/airtable-current/reclRFyb7EOWg9fYQ.jpg"
  },
  {
    "recordId": "recmFe8BwsTzjk1oe",
    "name": "Elisa Sednaoui",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Model, Actress & Founder, Funtasia",
    "bio": "Elisa Sednaoui is an Italian-born model, actress, and social entrepreneur raised between Europe and Egypt. She founded Funtasia to provide creative learning experiences for children, parents, and educators. Alongside her career in fashion and film, she champions education that supports self-expression, cultural understanding, and connection.",
    "hasHeadshot": true,
    "headshotBytes": 265201,
    "headshotFile": "/2026-headshots/airtable-current/recmFe8BwsTzjk1oe.jpg"
  },
  {
    "recordId": "recnirvb72mepu9zE",
    "name": "Dalaura Kader",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "Healthcare Entrepreneur & Community Volunteer",
    "bio": "Dalaura Kader is a healthcare entrepreneur whose background includes co-founding Stratify Genomics and working with Achieve Concierge. Alongside her professional work, she has served in volunteer leadership roles with Special Olympics Alberta and the National Charity League. Her experience spans business development, healthcare, and community service.",
    "hasHeadshot": true,
    "headshotBytes": 184555,
    "headshotFile": "/2026-headshots/airtable-current/recnirvb72mepu9zE.jpg"
  },
  {
    "recordId": "recnk2ezXOmNHDLIB",
    "name": "Logan Rose",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Founder & CEO, Big League Wiffle Ball",
    "bio": "Logan Rose is the founder and CEO of Big League Wiffle Ball, the world's first professional wiffle ball league. He also serves as Chief Executive Officer of Wiffle Ball Inc., the manufacturer of the original WIFFLE ball and bat, an American icon for more than 70 years. A Forbes 30 Under 30 honoree, he built BLW from backyard tournaments into 10 professional teams with live broadcasts on ESPN, backed by investors including Kevin Costner, Gary Vaynerchuk, Tony Robbins, and David Blitzer, while studying at SMU's Cox School of Business.",
    "hasHeadshot": true,
    "headshotBytes": 328612,
    "headshotFile": "/2026-headshots/airtable-current/recnk2ezXOmNHDLIB.jpg"
  },
  {
    "recordId": "recp6yqE1oP0rbrZX",
    "name": "James Cornish",
    "status": "Confirmed Attendance",
    "groups": [
      "X - attendee"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "recqj9ff6JKb3ch5c",
    "name": "Sara Steinweiss",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Founder & CEO, Conflict Resolution Systems",
    "bio": "Sara Steinweiss is the Founder and CEO of Conflict Resolution Systems and a speaker, educator, and conflict resolution strategist with more than 25 years of experience working with young people, educators, leaders, and communities. A former NYC public school educator, Sara’s work focuses on conflict resolution, de-escalation, social-emotional learning, positive psychology, and leadership. Through an authentic, relatable, and often humorous approach, she helps people strengthen communication, build resilience, and create more connected communities.",
    "hasHeadshot": true,
    "headshotBytes": 525202,
    "headshotFile": "/2026-headshots/airtable-current/recqj9ff6JKb3ch5c.jpg"
  },
  {
    "recordId": "recqkAMsTwRhrwbaL",
    "name": "Princess Love",
    "status": "Confirmed Attendance",
    "groups": [
      "D - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Television Personality, Entrepreneur & Poker Player",
    "bio": "Princess Love is a television personality, actress, and entrepreneur known for Love & Hip Hop: Hollywood. Born in Oakland and raised in Austin, she has expanded her work into beauty through PRELLA and competitive poker. Her poker accomplishments include winning the 2024 Celebrity Poker Invitational II and earning a six-figure payout at the 2023 WPT World Championship.",
    "hasHeadshot": true,
    "headshotBytes": 249583,
    "headshotFile": "/2026-headshots/airtable-current/recqkAMsTwRhrwbaL.jpg"
  },
  {
    "recordId": "recrw4J4m2FyRjZAe",
    "name": "Angie McPhaul",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Director of Youth Success, Gary Community Ventures",
    "bio": "Angie McPhaul leads youth-focused philanthropy at Gary Community Ventures, supporting academic achievement, wellbeing, and pathways beyond high school. A former teacher and district administrator with public policy experience, she has helped develop My Spark Denver, expanding access to meaningful learning and enrichment opportunities outside the classroom.",
    "hasHeadshot": true,
    "headshotBytes": 250505,
    "headshotFile": "/2026-headshots/airtable-current/recrw4J4m2FyRjZAe.jpg"
  },
  {
    "recordId": "recsRTmxXu43XfKIQ",
    "name": "Dr. Brad Keating",
    "status": "Confirmed Attendance",
    "groups": [
      "F - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Assistant Superintendent, Community Partnerships & Government Relations, CCSD",
    "bio": "Dr. Brad Keating is an assistant superintendent for the Clark County School District, overseeing community partnerships and government relations. His background includes special education and helping students with disabilities transition into employment. He brings classroom experience to work connecting schools with community resources and public policy.",
    "hasHeadshot": true,
    "headshotBytes": 185385,
    "headshotFile": "/2026-headshots/airtable-current/recsRTmxXu43XfKIQ.jpg"
  },
  {
    "recordId": "recz6YkVcNPoyUtJs",
    "name": "Bob Pittman",
    "status": "Withdrew",
    "groups": [
      "Founder"
    ],
    "occupation": "",
    "organization": "",
    "title": "",
    "bio": "",
    "hasHeadshot": false
  },
  {
    "recordId": "reczGv8CNQ9fKzZGc",
    "name": "Kate Flannery",
    "status": "Confirmed Attendance",
    "groups": [
      "C - talent"
    ],
    "occupation": "",
    "organization": "",
    "title": "Actress, Comedian & Singer",
    "bio": "Kate Flannery is an actress, comedian, and singer best known for playing Meredith Palmer on NBC’s The Office. She developed her comedy career with Chicago’s Second City and Annoyance Theatre before building a career across television, theater, and music. Her live performance work includes the comedy lounge act The Lampshades and touring alongside Jane Lynch.",
    "hasHeadshot": true,
    "headshotBytes": 2674265,
    "headshotFile": "/2026-headshots/airtable-current/reczGv8CNQ9fKzZGc.jpg"
  }
];
