/**
 * TEMPORARY general-election demo seed. DELETE THIS FILE AT GO-LIVE.
 *
 * Built from the Current Tracker sheet (Aug 17, 2026 snapshot). Used by
 * selectRaceCandidates() ONLY for races where no candidate carries the
 * sheet-driven in_general_election flag; once a race's winners are marked
 * in the sheet's "general ballot" column and republished, the sheet data
 * wins and this seed is ignored for that race.
 *
 * Sources, per race (tagged in the comments below):
 *  - [sheet]     the sheet's own "general ballot" = Y marks. Where a major
 *    party had only RUNOFF-status candidates, its top-raised runoff
 *    contender stands in until the sheet is updated.
 *  - [heuristic] placeholder pending editorial: incumbent, else each
 *    major party's top fundraiser (third parties above $50k); CA and WA
 *    use top-two overall. NY is heuristic because its sheet marks
 *    predate the June primary (every NY candidate is marked Y).
 *  - [+override] verified 2026 result applied: TX Senate runoff won by
 *    Paxton over Cornyn (May 26), so the sheet's pre-runoff Y is replaced.
 */
export const GENERAL_ELECTION_SEED: ReadonlySet<string> = new Set([
  // ================ AK ================
  // House 01 [heuristic]: Matt Schultz (D), Nick Begich III (R)
  "matt-schultz-ak",
  "nick-begich-iii-ak",
  // Senate [heuristic]: Mary Peltola (D), Dan Sullivan (R)
  "mary-peltola-ak",
  "dan-sullivan-ak",

  // ================ AL ================
  // House 00 [sheet]: Gordon Douglas "Doug" Jones (D), Thomas H. "Tommy" Tuberville (R), Phillip Ensler (D), John Wahl (R), Wayne Rogers (D), Caroleene Hardee Dobson (R)...
  "gordon-douglas-doug-jones-al",
  "thomas-h-tommy-tuberville-al",
  "phillip-ensler-al",
  "john-wahl-al",
  "wayne-rogers-al",
  "caroleene-hardee-dobson-al",
  "jeff-mclaughlin-al",
  "rosilyn-houston-al",
  "young-boozer-al",
  "violet-edwards-al",
  "andrew-sorrell-al",
  "ronald-d-ron-sparks-al",
  "corey-hill-al",
  // House 01 [heuristic]: Clyde W. Jones, Jr. (D), Austin Sidwell (R)
  "clyde-w-jones-jr-al",
  "austin-sidwell-al",
  // House 02 [heuristic]: Shomari C. Figures (D), Christopher Christian "Christian" Horn (R)
  "shomari-c-figures-al",
  "christopher-christian-christian-horn-al",
  // House 03 [sheet]: Michael Dennis "Mike" Rogers (R), Victor Lee "Lee" McInnis (D)
  "michael-dennis-mike-rogers-al",
  "victor-lee-lee-mcinnis-al",
  // House 04 [sheet]: Robert Brown Aderholt (R), Amanda Noelle Pusczek (D)
  "robert-brown-aderholt-al",
  "amanda-noelle-pusczek-al",
  // House 05 [sheet]: Dale Whitney Strong (R), Andrew Rankin Guyton Sneed (D)
  "dale-whitney-strong-al",
  "andrew-rankin-guyton-sneed-al",
  // House 06 [heuristic]: Jacob Henry Bouma-Sims (D), Gary J. Palmer (R)
  "jacob-henry-bouma-sims-al",
  "gary-j-palmer-al",
  // House 07 [heuristic]: Terrycina Andrea "Terri" Sewell (D), Ammie Akin (R)
  "terrycina-andrea-terri-sewell-al",
  "ammie-akin-al",
  // Senate [sheet]: Felix Barry "Barry" Moore (R), Everett W. Wess (D)
  "felix-barry-barry-moore-al",
  "everett-w-wess-al",

  // ================ AR ================
  // House 01 [sheet]: Terri Yarbrough Green (D), Eric Alan "Rick" Crawford (R)
  "terri-yarbrough-green-ar",
  "eric-alan-rick-crawford-ar",
  // House 02 [sheet]: Christopher Michael Jones (D), James French Hill (R)
  "christopher-michael-jones-ar",
  "james-french-hill-ar",
  // House 03 [sheet]: Robb Ryerse (D), Stephen Womack (R)
  "robb-ryerse-ar",
  "stephen-womack-ar",
  // House 04 [sheet]: James "Rus" Russell III (D), Bruce Westerman (R)
  "james-rus-russell-iii-ar",
  "bruce-westerman-ar",
  // Senate [sheet]: Hallie Shoffner (D), Thomas B. Cotton (R)
  "hallie-shoffner-ar",
  "thomas-b-cotton-ar",

  // ================ AZ ================
  // House 01 [heuristic]: Amish Shah (D), John Trobough (R)
  "amish-shah-az",
  "john-trobough-az",
  // House 02 [heuristic]: Jonathan Michael Nez (D), Eli Crane (R)
  "jonathan-michael-nez-az",
  "eli-crane-az",
  // House 03 [heuristic]: Yassamin Ansari (D)
  "yassamin-ansari-az",
  // House 04 [heuristic]: Greg Stanton (D), M. Zuhdi Jasser (R)
  "greg-stanton-az",
  "m-zuhdi-jasser-az",
  // House 05 [heuristic]: Brian Hualde (D), Daniel Keenan (R)
  "brian-hualde-az",
  "daniel-keenan-az",
  // House 06 [heuristic]: JoAnna "Jo" Mendoza (D), Juan Ciscomani (R)
  "joanna-jo-mendoza-az",
  "juan-ciscomani-az",
  // House 07 [heuristic]: Adelita Grijalva (D), Daniel Francis Butierez Sr (R)
  "adelita-grijalva-az",
  "daniel-francis-butierez-sr-az",
  // House 08 [heuristic]: Bernadette M. Greene-Placentia (D), Abraham "Abe" Hamadeh (R)
  "bernadette-m-greene-placentia-az",
  "abraham-abe-hamadeh-az",
  // House 09 [heuristic]: Danielle "Dani" Sterbinsky (D), Paul Anthony Gosar (R)
  "danielle-dani-sterbinsky-az",
  "paul-anthony-gosar-az",

  // ================ CA ================
  // House 01 [heuristic]: Audrey Denney (D), James Gallagher (R)
  "audrey-denney-ca",
  "james-gallagher-ca",
  // House 02 [heuristic]: Gregory Burgess (I), Jared Huffman (D)
  "gregory-burgess-ca",
  "jared-huffman-ca",
  // House 03 [heuristic]: Ami Bera (D), Chris Bennett (D)
  "ami-bera-ca",
  "chris-bennett-ca",
  // House 04 [heuristic]: Eric Jones (D), Mike Thompson (D)
  "eric-jones-ca",
  "mike-thompson-ca",
  // House 05 [heuristic]: Michael J. "Mike" Barkley (D), Michael Masuda (D)
  "michael-j-mike-barkley-ca",
  "michael-masuda-ca",
  // House 06 [heuristic]: Kevin Kiley (I), Lauren Babb Tomlinson (D)
  "kevin-kiley-ca",
  "lauren-babb-tomlinson-ca",
  // House 07 [heuristic]: Doris Matsui (D), Mai Vang (D)
  "doris-matsui-ca",
  "mai-vang-ca",
  // House 08 [heuristic]: Aaron Rowden (D), John Garamendi (D)
  "aaron-rowden-ca",
  "john-garamendi-ca",
  // House 09 [heuristic]: Josh Harder (D)
  "josh-harder-ca",
  // House 10 [heuristic]: Katherine Piccinni (R), Mark DeSaulnier (D)
  "katherine-piccinni-ca",
  "mark-desaulnier-ca",
  // House 11 [heuristic]: Connie Chan (D), Marie Hurabiell (D)
  "connie-chan-ca",
  "marie-hurabiell-ca",
  // House 12 [heuristic]: Lateefah Simon (D)
  "lateefah-simon-ca",
  // House 13 [heuristic]: Adam Gray (D), Kevin Lincoln (R)
  "adam-gray-ca",
  "kevin-lincoln-ca",
  // House 14 [heuristic]: Aisha Wahab (D), Carin Elam (D)
  "aisha-wahab-ca",
  "carin-elam-ca",
  // House 15 [heuristic]: Kevin Mullin (D), Mantosh Kumar (D)
  "kevin-mullin-ca",
  "mantosh-kumar-ca",
  // House 16 [heuristic]: Sam Liccardo (D)
  "sam-liccardo-ca",
  // House 17 [heuristic]: Ethan Agarwal (D), Mike Katz (D)
  "ethan-agarwal-ca",
  "mike-katz-ca",
  // House 18 [heuristic]: Chris Demers (I), Luis Arreguín (D)
  "chris-demers-ca",
  "luis-arregu-n-ca",
  // House 19 [heuristic]: Jimmy Panetta (D), Peter Coe Verbica (R)
  "jimmy-panetta-ca",
  "peter-coe-verbica-ca",
  // House 20 [heuristic]: Vince Fong (R)
  "vince-fong-ca",
  // House 21 [heuristic]: Jim Costa (D), Kyle Kirkland (R)
  "jim-costa-ca",
  "kyle-kirkland-ca",
  // House 22 [heuristic]: David G. Valadao (R), Jasmeet Bains (D)
  "david-g-valadao-ca",
  "jasmeet-bains-ca",
  // House 23 [heuristic]: Jay Obernolte (R), Karen Leigh Matthews (I)
  "jay-obernolte-ca",
  "karen-leigh-matthews-ca",
  // House 24 [heuristic]: Bob Smith (R), Salud Carbajal (D)
  "bob-smith-ca",
  "salud-carbajal-ca",
  // House 25 [heuristic]: Ceci Andrade Truman (R), Joe Males (R)
  "ceci-andrade-truman-ca",
  "joe-males-ca",
  // House 26 [heuristic]: Chris Espinosa (D), Jacqui Irwin (D)
  "chris-espinosa-ca",
  "jacqui-irwin-ca",
  // House 27 [heuristic]: George Whitesides (D), Jason Gibbs (R)
  "george-whitesides-ca",
  "jason-gibbs-ca",
  // House 28 [heuristic]: Judy Chu (D)
  "judy-chu-ca",
  // House 29 [heuristic]: Luz Maria Rivas (D)
  "luz-maria-rivas-ca",
  // House 30 [heuristic]: John Armenian (I), Laura Friedman (D)
  "john-armenian-ca",
  "laura-friedman-ca",
  // House 31 [heuristic]: Eric Ching (R), Gil Cisneros (D)
  "eric-ching-ca",
  "gil-cisneros-ca",
  // House 32 [heuristic]: Brad Sherman (D), Chris Ahuja (D)
  "brad-sherman-ca",
  "chris-ahuja-ca",
  // House 33 [heuristic]: Ernest "Ernie" Richter (R), Eugene Weems (R)
  "ernest-ernie-richter-ca",
  "eugene-weems-ca",
  // House 34 [heuristic]: Angela Gonzales-Torres (D), Jimmy Gomez (D)
  "angela-gonzales-torres-ca",
  "jimmy-gomez-ca",
  // House 35 [heuristic]: Norma J. Torres (D)
  "norma-j-torres-ca",
  // House 36 [heuristic]: Claire Ragge Anderson (I), Melissa Toomim (R)
  "claire-ragge-anderson-ca",
  "melissa-toomim-ca",
  // House 37 [heuristic]: Sydney Kamlager-Dove (D)
  "sydney-kamlager-dove-ca",
  // House 38 [heuristic]: Hilda Solis (D), Monica M. Sanchez (D)
  "hilda-solis-ca",
  "monica-m-sanchez-ca",
  // House 39 [heuristic]: Mark Takano (D)
  "mark-takano-ca",
  // House 40 [heuristic]: Esther Kim-Varet (D), Joe Kerr (D)
  "esther-kim-varet-ca",
  "joe-kerr-ca",
  // House 41 [heuristic]: Hector De La Torre (D), Linda Sánchez (D)
  "hector-de-la-torre-ca",
  "linda-s-nchez-ca",
  // House 42 [heuristic]: Brian Burley (R), Noah Von Blom (R)
  "brian-burley-ca",
  "noah-von-blom-ca",
  // House 43 [heuristic]: Maxine Waters (D)
  "maxine-waters-ca",
  // House 44 [heuristic]: Nanette Diaz Barragan (D)
  "nanette-diaz-barragan-ca",
  // House 45 [heuristic]: Amy Phan West (R), Chi "Charlie" Nguyen (R)
  "amy-phan-west-ca",
  "chi-charlie-nguyen-ca",
  // House 46 [heuristic]: David Pan (R), Lou Correa (D)
  "david-pan-ca",
  "lou-correa-ca",
  // House 47 [heuristic]: Dave Min (D), Eric Troutman (I)
  "dave-min-ca",
  "eric-troutman-ca",
  // House 48 [heuristic]: Abel Chavez (D), Ammar Campa-Najjar (D)
  "abel-chavez-ca",
  "ammar-campa-najjar-ca",
  // House 49 [heuristic]: Mike Levin (D), Star Parker (R)
  "mike-levin-ca",
  "star-parker-ca",
  // House 50 [heuristic]: Scott Peters (D)
  "scott-peters-ca",
  // House 51 [heuristic]: Sara Jacobs (D)
  "sara-jacobs-ca",
  // House 52 [heuristic]: Juan Vargas (D)
  "juan-vargas-ca",

  // ================ CO ================
  // House 01 [heuristic]: Diana DeGette (D)
  "diana-degette-co",
  // House 02 [heuristic]: Joe Neguse (D)
  "joe-neguse-co",
  // House 03 [heuristic]: Alex Kelloff (D), Jeff Hurd (R)
  "alex-kelloff-co",
  "jeff-hurd-co",
  // House 04 [heuristic]: Eileen Laubacher (D), Lauren Boebert (R)
  "eileen-laubacher-co",
  "lauren-boebert-co",
  // House 05 [heuristic]: Jessica Killin (D), Matt Cavanaugh (I)
  "jessica-killin-co",
  "matt-cavanaugh-co",
  // House 06 [heuristic]: Jason Crow (D), Jeff Crank (R)
  "jason-crow-co",
  "jeff-crank-co",
  // House 07 [heuristic]: Brittany Petersen (D), Timothy Bennett (R)
  "brittany-petersen-co",
  "timothy-bennett-co",
  // House 08 [heuristic]: Manny Rutinel (D), Gabe Evans (R)
  "manny-rutinel-co",
  "gabe-evans-co",
  // Senate [heuristic]: John Hickenlooper (D), Robert Chew (I)
  "john-hickenlooper-co",
  "robert-chew-co",

  // ================ GA ================
  // House 01 [heuristic]: Earl L. "Buddy" Carter (R)
  "earl-l-buddy-carter-ga",
  // House 02 [heuristic]: Sanford D. Bishop, Jr. (D)
  "sanford-d-bishop-jr-ga",
  // House 03 [heuristic]: Brian Jack (R)
  "brian-jack-ga",
  // House 04 [heuristic]: Henry C. "Hank" Johnson, Jr. (D)
  "henry-c-hank-johnson-jr-ga",
  // House 05 [heuristic]: Nikema Williams (D)
  "nikema-williams-ga",
  // House 06 [heuristic]: Lucy McBath (D)
  "lucy-mcbath-ga",
  // House 07 [heuristic]: Rich McCormick (R)
  "rich-mccormick-ga",
  // House 08 [heuristic]: Austin Scott (R)
  "austin-scott-ga",
  // House 09 [heuristic]: Andrew Clyde (R)
  "andrew-clyde-ga",
  // House 10 [heuristic]: Mike Collins (R)
  "mike-collins-ga",
  // House 11 [heuristic]: Barry Loudermilk (R)
  "barry-loudermilk-ga",
  // House 12 [heuristic]: Rick W. Allen (R)
  "rick-w-allen-ga",
  // House 13 [heuristic]: David A. Scott (D)
  "david-a-scott-ga",
  // House 14 [heuristic]: Shawn Harris (D), Clay Fuller (R)
  "shawn-harris-ga",
  "clay-fuller-ga",
  // Senate [heuristic]: Jon Ossoff (D), Derek Dooley (R)
  "jon-ossoff-ga",
  "derek-dooley-ga",

  // ================ HI ================
  // House 01 [heuristic]: Edward E. "Ed" Case (I), Jarrett K. Keohokalole (I)
  "edward-e-ed-case-hi",
  "jarrett-k-keohokalole-hi",
  // House 02 [heuristic]: Jill Naomi Tokuda (I)
  "jill-naomi-tokuda-hi",

  // ================ IA ================
  // House 01 [sheet]: Christina Bohannan (D), Mariannette Miller-Meeks (R)
  "christina-bohannan-ia",
  "mariannette-miller-meeks-ia",
  // House 02 [sheet]: Lindsay James (D), Joe Mitchell (R)
  "lindsay-james-ia",
  "joe-mitchell-ia",
  // House 03 [sheet]: Zach Nunn (R), Sarah Trone Garriott (D)
  "zach-nunn-ia",
  "sarah-trone-garriott-ia",
  // House 04 [sheet]: Chris McGowan (R), Dave Dawson (D)
  "chris-mcgowan-ia",
  "dave-dawson-ia",
  // Senate [sheet]: Ashley Hinson (R), Josh Turek (D)
  "ashley-hinson-ia",
  "josh-turek-ia",

  // ================ ID ================
  // House 01 [heuristic]: Kaylee Peterson (D), Russ Fulcher (R)
  "kaylee-peterson-id",
  "russ-fulcher-id",
  // House 02 [heuristic]: Michael K. Simpson (R)
  "michael-k-simpson-id",
  // Senate [heuristic]: Brad Moore (D), Jim Risch (R)
  "brad-moore-id",
  "jim-risch-id",

  // ================ IL ================
  // House 01 [sheet]: Jonathan L. Jackson (D), Christian Maxwell (R)
  "jonathan-l-jackson-il",
  "christian-maxwell-il",
  // House 02 [sheet]: Donna Miller (D), Michael Scott "Mike" Noack (R)
  "donna-miller-il",
  "michael-scott-mike-noack-il",
  // House 03 [sheet]: Delia C. Ramirez (D), Angel Oakley (R)
  "delia-c-ramirez-il",
  "angel-oakley-il",
  // House 04 [sheet]: Patty García (D), Lupe Castillo (R)
  "patty-garc-a-il",
  "lupe-castillo-il",
  // House 05 [sheet]: Mike Quigley (D), Tom "Tommy" Hanson (R)
  "mike-quigley-il",
  "tom-tommy-hanson-il",
  // House 06 [sheet]: Sean Casten (D), Niki Conforti (R)
  "sean-casten-il",
  "niki-conforti-il",
  // House 07 [sheet]: La Shawn K. Ford (D), Chad Koppie Sr. (R)
  "la-shawn-k-ford-il",
  "chad-koppie-sr-il",
  // House 08 [sheet]: Melissa Luburich Bean (D), Jennifer Davis (R)
  "melissa-luburich-bean-il",
  "jennifer-davis-il",
  // House 09 [sheet]: Daniel Biss (D), John Elleson (R)
  "daniel-biss-il",
  "john-elleson-il",
  // House 10 [sheet]: Bradley Scott "Brad" Schneider (D), Carl Lambrecht (R)
  "bradley-scott-brad-schneider-il",
  "carl-lambrecht-il",
  // House 11 [sheet]: G. William "Bill" Foster (D), Jeffrey D. "Jeff" Walter (R)
  "g-william-bill-foster-il",
  "jeffrey-d-jeff-walter-il",
  // House 12 [sheet]: Julie Fortier (D), Michael J. "Mike" Bost (R)
  "julie-fortier-il",
  "michael-j-mike-bost-il",
  // House 13 [sheet]: Nikki Budzinski (D), Jeff Wilson (R)
  "nikki-budzinski-il",
  "jeff-wilson-il",
  // House 14 [sheet]: Lauren A. Underwood (D), James Thomas "Jim" Marter (R)
  "lauren-a-underwood-il",
  "james-thomas-jim-marter-il",
  // House 15 [sheet]: Jennifer Ann Todd (D), Mary E. Miller (R)
  "jennifer-ann-todd-il",
  "mary-e-miller-il",
  // House 16 [sheet]: Paul Nolley (D), Darin McKay LaHood (R)
  "paul-nolley-il",
  "darin-mckay-lahood-il",
  // House 17 [sheet]: Eric Sorensen (D), Dillan S. Vancil (R)
  "eric-sorensen-il",
  "dillan-s-vancil-il",
  // Senate [sheet]: Juliana Stratton (D), Donald R. "Don" Tracy (R)
  "juliana-stratton-il",
  "donald-r-don-tracy-il",

  // ================ IN ================
  // House 01 [sheet]: Frank J. Mrvan (D), Barb Regnitz (R)
  "frank-j-mrvan-in",
  "barb-regnitz-in",
  // House 02 [sheet]: Rudolph C. Yakym III (R), Jamee Decio (D)
  "rudolph-c-yakym-iii-in",
  "jamee-decio-in",
  // House 03 [sheet]: Marlin A. Stutzman (R), Kelly Elizabeth Thompson (D)
  "marlin-a-stutzman-in",
  "kelly-elizabeth-thompson-in",
  // House 04 [sheet]: James R. Baird (R)
  "james-r-baird-in",
  // House 05 [sheet]: Victoria Spartz (R), James David Ford (D)
  "victoria-spartz-in",
  "james-david-ford-in",
  // House 06 [sheet]: Jefferson Shreve (R), Cynthia Wirth (D)
  "jefferson-shreve-in",
  "cynthia-wirth-in",
  // House 07 [sheet]: André D. Carson (D)
  "andr-d-carson-in",
  // House 08 [sheet]: Mark Messmer (R), Mary Theresa Allen (D)
  "mark-messmer-in",
  "mary-theresa-allen-in",
  // House 09 [sheet]: Erin Houchin (R), Bradley Allen Meyer (D)
  "erin-houchin-in",
  "bradley-allen-meyer-in",

  // ================ KS ================
  // House 01 [heuristic]: Don Coover (D), Tracey Robert Mann (R)
  "don-coover-ks",
  "tracey-robert-mann-ks",
  // House 02 [heuristic]: Derek Schmidt (R)
  "derek-schmidt-ks",
  // House 03 [heuristic]: Sharice L. Davids (D)
  "sharice-l-davids-ks",
  // House 04 [heuristic]: Katy Tyndell (D), Ron Estes (R)
  "katy-tyndell-ks",
  "ron-estes-ks",
  // Senate [heuristic]: Adam Hamilton (D), Roger W. "Doc" Marshall (R)
  "adam-hamilton-ks",
  "roger-w-doc-marshall-ks",

  // ================ KY ================
  // House 01 [heuristic]: James Comer (R)
  "james-comer-ky",
  // House 02 [heuristic]: Brett Guthrie (R)
  "brett-guthrie-ky",
  // House 03 [heuristic]: Morgan McGarvey (D)
  "morgan-mcgarvey-ky",
  // House 04 [heuristic]: Jesse Brewer (D), Thomas Massie (R)
  "jesse-brewer-ky",
  "thomas-massie-ky",
  // House 05 [heuristic]: Harold "Hal" Rogers (R)
  "harold-hal-rogers-ky",
  // House 06 [heuristic]: Jay Bowman (D), Adam Perez Arquette (R)
  "jay-bowman-ky",
  "adam-perez-arquette-ky",
  // Senate [heuristic]: Charles Booker (D), Andy Barr (R)
  "charles-booker-ky",
  "andy-barr-ky",

  // ================ LA ================
  // House 01 [heuristic]: Jamie Davis (D), Stephen J. "Steve" Scalise (R)
  "jamie-davis-la",
  "stephen-j-steve-scalise-la",
  // House 02 [heuristic]: Troy A. Carter, Sr. (D), Conrad Roberts Cable (R)
  "troy-a-carter-sr-la",
  "conrad-roberts-cable-la",
  // House 03 [heuristic]: Gary Crockett (D), Clay Higgins (R)
  "gary-crockett-la",
  "clay-higgins-la",
  // House 04 [heuristic]: Lindsay "Rubia" Garcia (D), James Michael "Mike" Johnson (R)
  "lindsay-rubia-garcia-la",
  "james-michael-mike-johnson-la",
  // House 05 [heuristic]: Michael Edward Mebruer (D), Blake Miguez (R)
  "michael-edward-mebruer-la",
  "blake-miguez-la",
  // House 06 [heuristic]: Cleo Fields (D)
  "cleo-fields-la",
  // Senate [heuristic]: Lauren Jewett (D), John Calvin Fleming, Jr. (R)
  "lauren-jewett-la",
  "john-calvin-fleming-jr-la",

  // ================ MD ================
  // House 01 [heuristic]: Dan Schwartz (D), Andrew Harris (R)
  "dan-schwartz-md",
  "andrew-harris-md",
  // House 02 [heuristic]: John Olszewski Jr. (D)
  "john-olszewski-jr-md",
  // House 03 [heuristic]: Sarah Elfreth (D)
  "sarah-elfreth-md",
  // House 04 [heuristic]: Glenn Ivey (D)
  "glenn-ivey-md",
  // House 05 [heuristic]: Adrian Boafo (D)
  "adrian-boafo-md",
  // House 06 [heuristic]: April McClain Delaney (D), Christopher Burnett (R)
  "april-mcclain-delaney-md",
  "christopher-burnett-md",
  // House 07 [heuristic]: Kweisi Mfume (D)
  "kweisi-mfume-md",
  // House 08 [heuristic]: Jamie Raskin (D)
  "jamie-raskin-md",

  // ================ ME ================
  // House 01 [sheet]: Chellie Pingree (D), Ronald Russell (R)
  "chellie-pingree-me",
  "ronald-russell-me",
  // House 02 [sheet]: Paul LePage (R), Joe Baldacci (D), Matt Dunlap (D), Jordan Wood (D)
  "paul-lepage-me",
  "joe-baldacci-me",
  "matt-dunlap-me",
  "jordan-wood-me",
  // Senate [sheet]: Susan Collins (R), Graham Platner (D)
  "susan-collins-me",
  "graham-platner-me",

  // ================ MI ================
  // House 01 [heuristic]: Jack Bergman (R)
  "jack-bergman-mi",
  // House 02 [heuristic]: John Moolenaar (R)
  "john-moolenaar-mi",
  // House 03 [heuristic]: Hillary Scholten (D)
  "hillary-scholten-mi",
  // House 04 [heuristic]: Bill Huizenga (R)
  "bill-huizenga-mi",
  // House 05 [heuristic]: Tim Walberg (R)
  "tim-walberg-mi",
  // House 06 [heuristic]: Debbie Dingell (D)
  "debbie-dingell-mi",
  // House 07 [heuristic]: Tom Barrett (R)
  "tom-barrett-mi",
  // House 08 [heuristic]: Kristen McDonald Rivet (D)
  "kristen-mcdonald-rivet-mi",
  // House 09 [heuristic]: Lisa McClain (R)
  "lisa-mcclain-mi",
  // House 10 [heuristic]: Justin Kirk (R)
  "justin-kirk-mi",
  // House 11 [heuristic]: Mike Steger (R)
  "mike-steger-mi",
  // House 12 [heuristic]: Rashida Tlaib (D)
  "rashida-tlaib-mi",
  // House 13 [heuristic]: Shri Thanedar (D)
  "shri-thanedar-mi",
  // Senate [heuristic]: Abdul El-Sayed (D), Mike Rogers (R)
  "abdul-el-sayed-mi",
  "mike-rogers-mi",

  // ================ MO ================
  // House 01 [heuristic]: Wesley Bell (D)
  "wesley-bell-mo",
  // House 02 [heuristic]: Frederick Paul "Fred" "FP" Wellman (D), Ann L. Wagner (R)
  "frederick-paul-fred-fp-wellman-mo",
  "ann-l-wagner-mo",
  // House 03 [heuristic]: Robert Frank "Bob" Onder, Jr. (R)
  "robert-frank-bob-onder-jr-mo",
  // House 04 [heuristic]: Mark Alford (R)
  "mark-alford-mo",
  // House 05 [heuristic]: Emanuel Cleaver, II (D), Richard Ray "Rick" Brattin, Jr. (R)
  "emanuel-cleaver-ii-mo",
  "richard-ray-rick-brattin-jr-mo",
  // House 06 [heuristic]: Josh Smead (D), Chris Stigall (R)
  "josh-smead-mo",
  "chris-stigall-mo",
  // House 07 [heuristic]: Missi Hesketh (D), Eric W. Burlison (R)
  "missi-hesketh-mo",
  "eric-w-burlison-mo",
  // House 08 [heuristic]: Jason T. Smith (R)
  "jason-t-smith-mo",

  // ================ MS ================
  // House 01 [sheet]: James Clifton "Cliff" Johnson III (D), John Trent "Trent" Kelly (R)
  "james-clifton-cliff-johnson-iii-ms",
  "john-trent-trent-kelly-ms",
  // House 02 [sheet]: Bennie G. Thompson (D), Ron Eller (R)
  "bennie-g-thompson-ms",
  "ron-eller-ms",
  // House 03 [sheet]: Michael Alexis Chiaradio (D), Michael Patrick Guest (R)
  "michael-alexis-chiaradio-ms",
  "michael-patrick-guest-ms",
  // House 04 [sheet]: Jeffrey Hulum III (D), Walter Michael "Mike" Ezell (R)
  "jeffrey-hulum-iii-ms",
  "walter-michael-mike-ezell-ms",
  // Senate [sheet]: Scott Colom (D), Cindy Hyde-Smith (R)
  "scott-colom-ms",
  "cindy-hyde-smith-ms",

  // ================ MT ================
  // House 01 [sheet]: Sam Forstag (D), Aaron Flint (R)
  "sam-forstag-mt",
  "aaron-flint-mt",
  // House 02 [sheet]: Troy Downing (R)
  "troy-downing-mt",
  // Senate [sheet]: Kurt Alme (R), Seth Bodnar (I)
  "kurt-alme-mt",
  "seth-bodnar-mt",

  // ================ NC ================
  // House 01 [sheet]: Laurie Gaye Moe Buckhout (R)
  "laurie-gaye-moe-buckhout-nc",
  // House 02 [heuristic]: Deborah Koff Ross (D), Eugene Farley Douglass (R)
  "deborah-koff-ross-nc",
  "eugene-farley-douglass-nc",
  // House 03 [sheet]: Raymond Edward Smith, Jr. (D)
  "raymond-edward-smith-jr-nc",
  // House 04 [sheet]: Valerie Paige Foushee (D)
  "valerie-paige-foushee-nc",
  // House 05 [sheet]: Charles Noble "Chuck" Hubbard (D), Virginia Ann Foxx (R)
  "charles-noble-chuck-hubbard-nc",
  "virginia-ann-foxx-nc",
  // House 06 [sheet]: Cyril Anthony Jefferson (D)
  "cyril-anthony-jefferson-nc",
  // House 07 [sheet]: David Cheston Rouzer (R)
  "david-cheston-rouzer-nc",
  // House 08 [sheet]: Colby Lawrence Watson (D)
  "colby-lawrence-watson-nc",
  // House 09 [sheet]: Richard Neece Ojeda, II (D)
  "richard-neece-ojeda-ii-nc",
  // House 10 [sheet]: Ashley Thrasher Bell (D), Patrick Luke "Pat" Harrigan (R)
  "ashley-thrasher-bell-nc",
  "patrick-luke-pat-harrigan-nc",
  // House 11 [sheet]: James Peterson "Jamie" Ager (D), Charles Marion "Chuck" Edwards (R)
  "james-peterson-jamie-ager-nc",
  "charles-marion-chuck-edwards-nc",
  // House 12 [sheet]: Alma Shealey Adams (D), John Christopher "Jack" Codiga (R)
  "alma-shealey-adams-nc",
  "john-christopher-jack-codiga-nc",
  // House 13 [sheet]: Paul Jehu Barringer, III (D), John Bradford "Brad" Knott (R)
  "paul-jehu-barringer-iii-nc",
  "john-bradford-brad-knott-nc",
  // House 14 [sheet]: LaKesha Shanese Womack (D), Timothy Keith "Tim" Moore (R)
  "lakesha-shanese-womack-nc",
  "timothy-keith-tim-moore-nc",
  // Senate [sheet]: Roy Asberry Cooper III (D), Michael David Whatley (R)
  "roy-asberry-cooper-iii-nc",
  "michael-david-whatley-nc",

  // ================ ND ================
  // House 00 [sheet]: Trygve Hammer (D), Julie Fedorchak (R)
  "trygve-hammer-nd",
  "julie-fedorchak-nd",

  // ================ NE ================
  // House 01 [heuristic]: Christopher "Chris" Backemeyer (D), Mike Flood (R)
  "christopher-chris-backemeyer-ne",
  "mike-flood-ne",
  // House 02 [heuristic]: Crystal Rhoades (D), Brinker Harding (R)
  "crystal-rhoades-ne",
  "brinker-harding-ne",
  // House 03 [heuristic]: Becky Lynn Kelly Stille (D), Adrian M. Smith (R)
  "becky-lynn-kelly-stille-ne",
  "adrian-m-smith-ne",
  // Senate [heuristic]: Pete Ricketts (R)
  "pete-ricketts-ne",

  // ================ NJ ================
  // House 01 [heuristic]: Donald Norcross (D)
  "donald-norcross-nj",
  // House 02 [heuristic]: Bayly Winder (D), Jeff Van Drew (R)
  "bayly-winder-nj",
  "jeff-van-drew-nj",
  // House 03 [heuristic]: Herb Conaway (D)
  "herb-conaway-nj",
  // House 04 [heuristic]: Christopher H. Smith (R)
  "christopher-h-smith-nj",
  // House 05 [heuristic]: Josh Gottheimer (D)
  "josh-gottheimer-nj",
  // House 06 [heuristic]: Frank Pallone Jr. (D)
  "frank-pallone-jr-nj",
  // House 07 [heuristic]: Thomas H. Kean Jr. (R)
  "thomas-h-kean-jr-nj",
  // House 08 [heuristic]: Rob Menendez (D)
  "rob-menendez-nj",
  // House 10 [heuristic]: LaMonica McIver (D)
  "lamonica-mciver-nj",
  // House 11 [heuristic]: Analilia Mejia (D)
  "analilia-mejia-nj",
  // House 12 [heuristic]: Bonnie Watson Coleman (D), Gregg Mele (R)
  "bonnie-watson-coleman-nj",
  "gregg-mele-nj",

  // ================ NM ================
  // House 01 [heuristic]: Melanie Stansbury (D), Didi Okpareke (R)
  "melanie-stansbury-nm",
  "didi-okpareke-nm",
  // House 02 [heuristic]: Gabe Vasquez (D), Greg Cunningham (R)
  "gabe-vasquez-nm",
  "greg-cunningham-nm",
  // House 03 [heuristic]: Teresa Leger Fernández (D), Martin Zamora (R)
  "teresa-leger-fern-ndez-nm",
  "martin-zamora-nm",
  // Senate [heuristic]: Ben Ray Luján (D), Larry Marker (R)
  "ben-ray-luj-n-nm",
  "larry-marker-nm",

  // ================ NV ================
  // House 01 [sheet]: Dina Titus (D), Carrie Buck (R)
  "dina-titus-nv",
  "carrie-buck-nv",
  // House 02 [sheet]: Teresa Benitez-Thompson (D), David Flippo (R)
  "teresa-benitez-thompson-nv",
  "david-flippo-nv",
  // House 03 [sheet]: Susie Lee (D), Marty O'Donnell (R)
  "susie-lee-nv",
  "marty-odonnell-nv",
  // House 04 [sheet]: Steven Horsford (D), Cody Whipple (R)
  "steven-horsford-nv",
  "cody-whipple-nv",

  // ================ NY ================
  // House 01 [heuristic]: Christopher "Chris" Gallant (D), Nicholas J. "Nick" LaLota (R)
  "christopher-chris-gallant-ny",
  "nicholas-j-nick-lalota-ny",
  // House 02 [heuristic]: Patrick "Pat" Halpin (D), Andrew R. Garbarino (R)
  "patrick-pat-halpin-ny",
  "andrew-r-garbarino-ny",
  // House 03 [heuristic]: Thomas R. "Tom" Suozzi (D), Gregory "Greg" Hach (R)
  "thomas-r-tom-suozzi-ny",
  "gregory-greg-hach-ny",
  // House 04 [heuristic]: Laura Gillen (D), Jeanine C. Driscoll (R)
  "laura-gillen-ny",
  "jeanine-c-driscoll-ny",
  // House 05 [heuristic]: Gregory Weldon Meeks (D), George Marsh (R)
  "gregory-weldon-meeks-ny",
  "george-marsh-ny",
  // House 06 [heuristic]: Grace Meng (D), Joseph Chou (R)
  "grace-meng-ny",
  "joseph-chou-ny",
  // House 07 [heuristic]: Antonio Reynoso (D), Melvin Rivera (R)
  "antonio-reynoso-ny",
  "melvin-rivera-ny",
  // House 08 [heuristic]: Hakeem S. Jeffries (D), Lewis Mizrahi (R)
  "hakeem-s-jeffries-ny",
  "lewis-mizrahi-ny",
  // House 09 [heuristic]: Yvette D. Clarke (D), Joel Anabilah-Azumah (R)
  "yvette-d-clarke-ny",
  "joel-anabilah-azumah-ny",
  // House 10 [heuristic]: Daniel "Dan" Goldman (D), Jennifer Moore (R)
  "daniel-dan-goldman-ny",
  "jennifer-moore-ny",
  // House 11 [heuristic]: Allison Ziogas (D), Nicole Malliotakis (R)
  "allison-ziogas-ny",
  "nicole-malliotakis-ny",
  // House 12 [heuristic]: Alexander "Alex" Bores (D), Caroline Shinkle (R)
  "alexander-alex-bores-ny",
  "caroline-shinkle-ny",
  // House 13 [heuristic]: Adriano Espaillat (D), Manual "Jomo" Williams (R)
  "adriano-espaillat-ny",
  "manual-jomo-williams-ny",
  // House 14 [heuristic]: Alexandria Ocasio-Cortez (D), Diamant Hysenaj (R)
  "alexandria-ocasio-cortez-ny",
  "diamant-hysenaj-ny",
  // House 15 [heuristic]: Ritchie John Torres (D), Stylo Sapaskis (R)
  "ritchie-john-torres-ny",
  "stylo-sapaskis-ny",
  // House 16 [heuristic]: George Stephen Latimer (D), Joseph J. Cinquemani (R)
  "george-stephen-latimer-ny",
  "joseph-j-cinquemani-ny",
  // House 17 [heuristic]: Beth J. Davidson (D), Michael Vincent "Mike" Lawler (R)
  "beth-j-davidson-ny",
  "michael-vincent-mike-lawler-ny",
  // House 18 [heuristic]: Patrick K. "Pat" Ryan (D), Jacqueline Mary "Jackie" Auringer (R)
  "patrick-k-pat-ryan-ny",
  "jacqueline-mary-jackie-auringer-ny",
  // House 19 [heuristic]: Josh Riley (D), Alexander M. "Alex" Portelli (R)
  "josh-riley-ny",
  "alexander-m-alex-portelli-ny",
  // House 20 [heuristic]: Paul David Tonko (D), Ralph F. Ambrosio (R)
  "paul-david-tonko-ny",
  "ralph-f-ambrosio-ny",
  // House 21 [heuristic]: Blake Gendebien (D), Anthony Thomas Constantino (R)
  "blake-gendebien-ny",
  "anthony-thomas-constantino-ny",
  // House 22 [heuristic]: John W. Mannion (D), Kailee Marie Buller (R)
  "john-w-mannion-ny",
  "kailee-marie-buller-ny",
  // House 23 [heuristic]: Aaron Gies (D), Nicholas A. "Nick" Langworthy (R)
  "aaron-gies-ny",
  "nicholas-a-nick-langworthy-ny",
  // House 24 [heuristic]: Alissa J. Ellman (D), Claudia Tenney (R)
  "alissa-j-ellman-ny",
  "claudia-tenney-ny",
  // House 25 [heuristic]: Joseph D. "Joe" Morelle (D), Virginia E. McIntyre (R)
  "joseph-d-joe-morelle-ny",
  "virginia-e-mcintyre-ny",
  // House 26 [heuristic]: Timothy M. "Tim" Kennedy (D), Dennis E. Hannon (R)
  "timothy-m-tim-kennedy-ny",
  "dennis-e-hannon-ny",

  // ================ OH ================
  // House 01 [sheet]: Greg Landsman (D), Eric Conroy (R)
  "greg-landsman-oh",
  "eric-conroy-oh",
  // House 02 [sheet]: David "Dave" J. Taylor (R)
  "david-dave-j-taylor-oh",
  // House 03 [sheet]: Joyce B. Beatty (D)
  "joyce-b-beatty-oh",
  // House 04 [sheet]: James "Jim" D. Jordan (R)
  "james-jim-d-jordan-oh",
  // House 05 [sheet]: Robert Edward Latta (R)
  "robert-edward-latta-oh",
  // House 06 [sheet]: Michael A. Rulli (R)
  "michael-a-rulli-oh",
  // House 07 [sheet]: Max Miller (R), Brian K. Poindexter (D)
  "max-miller-oh",
  "brian-k-poindexter-oh",
  // House 08 [sheet]: Warren Davidson (R)
  "warren-davidson-oh",
  // House 09 [sheet]: Marcia Carolyn Kaptur (D), Derek Merrin (R)
  "marcia-carolyn-kaptur-oh",
  "derek-merrin-oh",
  // House 10 [sheet]: Michael R. Turner (R), Kristina Knickerbocker (D)
  "michael-r-turner-oh",
  "kristina-knickerbocker-oh",
  // House 11 [sheet]: Shontel M. Brown (D)
  "shontel-m-brown-oh",
  // House 12 [sheet]: William Troy Balderson (R), Jerrad Shane Christian (D)
  "william-troy-balderson-oh",
  "jerrad-shane-christian-oh",
  // House 13 [sheet]: Emilia Sykes (D), Carey Coleman (R)
  "emilia-sykes-oh",
  "carey-coleman-oh",
  // House 14 [sheet]: David P. Joyce (R), Maria Jukic (D)
  "david-p-joyce-oh",
  "maria-jukic-oh",
  // House 15 [sheet]: Mike Carey (R), Don Ralph Leonard (D)
  "mike-carey-oh",
  "don-ralph-leonard-oh",
  // Senate [sheet]: Sherrod Brown (D), Jon A. Husted (R)
  "sherrod-brown-oh",
  "jon-a-husted-oh",

  // ================ OK ================
  // House 01 [heuristic]: John Croisant (D), Courtney Gill (R)
  "john-croisant-ok",
  "courtney-gill-ok",
  // House 02 [heuristic]: Brandon Wade (D), Josh Brecheen (R)
  "brandon-wade-ok",
  "josh-brecheen-ok",
  // House 03 [heuristic]: Jules Roberson (D), Frank Lucas (R)
  "jules-roberson-ok",
  "frank-lucas-ok",
  // House 04 [heuristic]: Jeff Pixley (D), Tom Cole (R)
  "jeff-pixley-ok",
  "tom-cole-ok",
  // House 05 [heuristic]: Jena Nelson (D), Stephanie Bice (R)
  "jena-nelson-ok",
  "stephanie-bice-ok",
  // Senate [sheet]: Sevier White (L), Ervin Yen (D), Brian Ragain (R)
  "sevier-white-ok",
  "ervin-yen-ok",
  "brian-ragain-ok",

  // ================ OR ================
  // House 01 [heuristic]: Suzanne Bonamici (D)
  "suzanne-bonamici-or",
  // House 02 [heuristic]: Cliff Bentz (R)
  "cliff-bentz-or",
  // House 03 [heuristic]: Maxine Dexter (D)
  "maxine-dexter-or",
  // House 04 [heuristic]: Val Hoyle (D), Monique DeSpain (R)
  "val-hoyle-or",
  "monique-despain-or",
  // House 05 [heuristic]: Janelle Bynum (D), Jonathan Lockwood (R)
  "janelle-bynum-or",
  "jonathan-lockwood-or",
  // House 06 [heuristic]: Andrea Salinas (D)
  "andrea-salinas-or",
  // Senate [heuristic]: Jeff Merkley (D), Brent Barker (R)
  "jeff-merkley-or",
  "brent-barker-or",

  // ================ PA ================
  // House 01 [heuristic]: Bob Harvie (D), Brian K. Fitzpatrick (R)
  "bob-harvie-pa",
  "brian-k-fitzpatrick-pa",
  // House 02 [heuristic]: Brendan F. Boyle (D)
  "brendan-f-boyle-pa",
  // House 03 [heuristic]: Dwight Evans (D)
  "dwight-evans-pa",
  // House 04 [heuristic]: Madeleine Dean (D)
  "madeleine-dean-pa",
  // House 05 [heuristic]: Mary Gay Scanlon (D)
  "mary-gay-scanlon-pa",
  // House 06 [heuristic]: Chrissy Houlahan (D)
  "chrissy-houlahan-pa",
  // House 07 [heuristic]: Ryan Mackenzie (R)
  "ryan-mackenzie-pa",
  // House 08 [heuristic]: Rob Bresnahan (R)
  "rob-bresnahan-pa",
  // House 09 [heuristic]: Dan Meuser (R)
  "dan-meuser-pa",
  // House 10 [heuristic]: Janelle Stelson (D), Scott Perry (R)
  "janelle-stelson-pa",
  "scott-perry-pa",
  // House 11 [heuristic]: Lloyd Smucker (R)
  "lloyd-smucker-pa",
  // House 12 [heuristic]: Summer Lee (D)
  "summer-lee-pa",
  // House 13 [heuristic]: John Joyce (R)
  "john-joyce-pa",
  // House 14 [heuristic]: Guy Reschenthaler (R)
  "guy-reschenthaler-pa",
  // House 15 [heuristic]: Glenn "GT" Thompson (R)
  "glenn-gt-thompson-pa",
  // House 16 [heuristic]: Mike Kelly (R)
  "mike-kelly-pa",
  // House 17 [heuristic]: Chris Deluzio (D)
  "chris-deluzio-pa",

  // ================ SC ================
  // House 02 [heuristic]: David Robinson II (D), Joe Wilson (R)
  "david-robinson-ii-sc",
  "joe-wilson-sc",
  // House 03 [heuristic]: Eunice Lehmacher (D), Sheri Biggs (R)
  "eunice-lehmacher-sc",
  "sheri-biggs-sc",
  // House 04 [heuristic]: Courtney McClain (D), William Timmons (R)
  "courtney-mcclain-sc",
  "william-timmons-sc",
  // House 06 [heuristic]: Jim Clyburn (D), Maurice Washington (R)
  "jim-clyburn-sc",
  "maurice-washington-sc",
  // House 07 [heuristic]: Russel Fry (R)
  "russel-fry-sc",
  // Senate [heuristic]: Annie Andrews (D), Linsey Graham (R)
  "annie-andrews-sc",
  "linsey-graham-sc",

  // ================ SD ================
  // House 00 [heuristic]: Billy Mawhiney (D), Dusty Johnson (R)
  "billy-mawhiney-sd",
  "dusty-johnson-sd",
  // Senate [heuristic]: Dan Ahlers (D), Mike Rounds (R)
  "dan-ahlers-sd",
  "mike-rounds-sd",

  // ================ TN ================
  // House 01 [heuristic]: Diana Lynn Harshbarger (R), Kristi Amber Mickelle Burke (I)
  "diana-lynn-harshbarger-tn",
  "kristi-amber-mickelle-burke-tn",
  // House 02 [heuristic]: Tim Burchett (R), Michaela J. Barnett (I)
  "tim-burchett-tn",
  "michaela-j-barnett-tn",
  // House 03 [heuristic]: Charles J. "Chuck" Fleischmann (R), Anna M. Golladay (I)
  "charles-j-chuck-fleischmann-tn",
  "anna-m-golladay-tn",
  // House 04 [heuristic]: Victoria Isabel Broderick (I)
  "victoria-isabel-broderick-tn",
  // House 05 [heuristic]: Charles W. "Charlie" Hatcher (R), Charles M. "Chaz" Molder (I)
  "charles-w-charlie-hatcher-tn",
  "charles-m-chaz-molder-tn",
  // House 06 [heuristic]: Johnny C. Garrett (R)
  "johnny-c-garrett-tn",
  // House 07 [heuristic]: Matthew Robert "Matt" Van Epps (R), Daren Hunter Copeland (I)
  "matthew-robert-matt-van-epps-tn",
  "daren-hunter-copeland-tn",
  // House 08 [heuristic]: David Kustoff (R)
  "david-kustoff-tn",
  // House 09 [heuristic]: Brent Taylor (R), Justin J. Pearson (I)
  "brent-taylor-tn",
  "justin-j-pearson-tn",
  // Senate [heuristic]: Bill Hagerty (R)
  "bill-hagerty-tn",

  // ================ TX ================
  // House 01 [sheet]: Nathan Quentin Moran (D)
  "nathan-quentin-moran-tx",
  // House 02 [sheet]: Steve Toth (R), Shaun Finnie (D)
  "steve-toth-tx",
  "shaun-finnie-tx",
  // House 03 [sheet]: Keith Self (R), Evan Hunt (D)
  "keith-self-tx",
  "evan-hunt-tx",
  // House 04 [sheet]: Jason Pearce (D), Pat Fallon (R)
  "jason-pearce-tx",
  "pat-fallon-tx",
  // House 05 [sheet]: Lance Gooden (R), Chelsey Hockett (D)
  "lance-gooden-tx",
  "chelsey-hockett-tx",
  // House 06 [sheet]: Danny Minton (D), John Kevin "Jake" Ellzey (R)
  "danny-minton-tx",
  "john-kevin-jake-ellzey-tx",
  // House 07 [sheet]: Elizabeth Pannill Fletcher (D), Alexander Hale (R)
  "elizabeth-pannill-fletcher-tx",
  "alexander-hale-tx",
  // House 08 [sheet]: Jessica Steinmann (R), Laura Jones (D)
  "jessica-steinmann-tx",
  "laura-jones-tx",
  // House 09 [sheet]: Leticia Gutierrez (D), Alexandra Mealer (R)
  "leticia-gutierrez-tx",
  "alexandra-mealer-tx",
  // House 10 [sheet]: Chris Gober (R), Caitlin McClay Rourk (D)
  "chris-gober-tx",
  "caitlin-mcclay-rourk-tx",
  // House 11 [sheet]: August Pfluger (R), Claire Reynolds (D)
  "august-pfluger-tx",
  "claire-reynolds-tx",
  // House 12 [sheet]: Craig Goldman (R), Angela "Heli" Rodriguez Prillman (D)
  "craig-goldman-tx",
  "angela-heli-rodriguez-prillman-tx",
  // House 13 [sheet]: Ronny Lynn Jackson (R), Mark Nair (D)
  "ronny-lynn-jackson-tx",
  "mark-nair-tx",
  // House 14 [sheet]: Randy Weber (R), Richard Harvey Davis III (D)
  "randy-weber-tx",
  "richard-harvey-davis-iii-tx",
  // House 15 [sheet]: Monica De La Cruz-Hernandez (R), Bobby Pulido (D)
  "monica-de-la-cruz-hernandez-tx",
  "bobby-pulido-tx",
  // House 16 [sheet]: Veronica Escobar (D), Adam Bauman (R)
  "veronica-escobar-tx",
  "adam-bauman-tx",
  // House 17 [sheet]: Peter Andrew Sessions (R), Casey Shepard (D)
  "peter-andrew-sessions-tx",
  "casey-shepard-tx",
  // House 18 [sheet]: Ronald Dwayne Whitfield (R), Alexander Green (D)
  "ronald-dwayne-whitfield-tx",
  "alexander-green-tx",
  // House 19 [sheet]: Kyle Rable (D), Tom Sell (R)
  "kyle-rable-tx",
  "tom-sell-tx",
  // House 20 [sheet]: Joaquin Castro (D), Edgardo Rafael Baez (R)
  "joaquin-castro-tx",
  "edgardo-rafael-baez-tx",
  // House 21 [sheet]: Kristin Hook (D), Mark Teixeira (R)
  "kristin-hook-tx",
  "mark-teixeira-tx",
  // House 22 [sheet]: Marquette Greene-Scott (D), Trever Nehls (R)
  "marquette-greene-scott-tx",
  "trever-nehls-tx",
  // House 23 [sheet]: Katy Padilla Stout (D), Brandon Herrera (R)
  "katy-padilla-stout-tx",
  "brandon-herrera-tx",
  // House 24 [sheet]: Elizabeth "Beth" Ann Van Duyne (R), Kevin Burge (D)
  "elizabeth-beth-ann-van-duyne-tx",
  "kevin-burge-tx",
  // House 25 [sheet]: Roger Williams (R), Dione Sims (D)
  "roger-williams-tx",
  "dione-sims-tx",
  // House 26 [sheet]: Brandon Gill (R), Steven Shook (D)
  "brandon-gill-tx",
  "steven-shook-tx",
  // House 27 [sheet]: Michael Cloud (R), Tanya Lloyd (D)
  "michael-cloud-tx",
  "tanya-lloyd-tx",
  // House 28 [sheet]: Henry Cuellar (D), Tano E. Tijerina (R)
  "henry-cuellar-tx",
  "tano-e-tijerina-tx",
  // House 29 [sheet]: Sylvia Garcia (D), Martha Elena Fierro (R)
  "sylvia-garcia-tx",
  "martha-elena-fierro-tx",
  // House 30 [sheet]: Frederick Haynes (D), Everett Jackson (R)
  "frederick-haynes-tx",
  "everett-jackson-tx",
  // House 31 [sheet]: Justin Early (D), John Carter (R)
  "justin-early-tx",
  "john-carter-tx",
  // House 32 [sheet]: Dan Barrios (D), Jace Yarbrough (R)
  "dan-barrios-tx",
  "jace-yarbrough-tx",
  // House 33 [heuristic]: Colin Allred (D), Patrick David Gillspie (R)
  "colin-allred-tx",
  "patrick-david-gillspie-tx",
  // House 34 [sheet]: Vicente Gonzalez (D), Eric D. Flores (R)
  "vicente-gonzalez-tx",
  "eric-d-flores-tx",
  // House 35 [heuristic]: Johnny C. Garcia (D), Carlos De La Cruz, Jr (R)
  "johnny-c-garcia-tx",
  "carlos-de-la-cruz-jr-tx",
  // House 36 [sheet]: Brian Babin (R), Rhonda Hart (D)
  "brian-babin-tx",
  "rhonda-hart-tx",
  // House 37 [sheet]: Gregorio Casar (D), Ge'nell Gary (R)
  "gregorio-casar-tx",
  "genell-gary-tx",
  // House 38 [sheet]: Melissa McDonough (D), Jon Bonck (R)
  "melissa-mcdonough-tx",
  "jon-bonck-tx",
  // Senate [sheet+override]: James Talarico (D), Warren Kenneth Paxton (R)
  "james-talarico-tx",
  "warren-kenneth-paxton-tx",

  // ================ UT ================
  // House 01 [heuristic]: Ben McAdams (D), Riley Owen (R)
  "ben-mcadams-ut",
  "riley-owen-ut",
  // House 02 [heuristic]: Blake Moore (R)
  "blake-moore-ut",
  // House 03 [heuristic]: Celeste Maloy (R)
  "celeste-maloy-ut",
  // House 04 [heuristic]: Mike Kennedy (R)
  "mike-kennedy-ut",

  // ================ VA ================
  // House 01 [heuristic]: Rob Wittman (R)
  "rob-wittman-va",
  // House 02 [heuristic]: Jen Kiggans (R)
  "jen-kiggans-va",
  // House 03 [heuristic]: Bobby Scott (D)
  "bobby-scott-va",
  // House 04 [heuristic]: Jennifer McClellan (D)
  "jennifer-mcclellan-va",
  // House 05 [heuristic]: John McGuire (R)
  "john-mcguire-va",
  // House 06 [heuristic]: Ben Cline (R)
  "ben-cline-va",
  // House 07 [heuristic]: Eugene Vindman (D)
  "eugene-vindman-va",
  // House 08 [heuristic]: Don Beyer (D)
  "don-beyer-va",
  // House 09 [heuristic]: Morgan Griffith (R)
  "morgan-griffith-va",
  // House 10 [heuristic]: Suhas Subramanyam (D)
  "suhas-subramanyam-va",
  // House 11 [heuristic]: James Walkinshaw (D)
  "james-walkinshaw-va",
  // Senate [heuristic]: Mark Warner (D)
  "mark-warner-va",

  // ================ WA ================
  // House 01 [heuristic]: Suzan Kay DelBene (I)
  "suzan-kay-delbene-wa",
  // House 02 [heuristic]: Richard Ray "Rick" Larsen (I)
  "richard-ray-rick-larsen-wa",
  // House 03 [heuristic]: Marie Gluesenkamp Perez (I), John Braun (I)
  "marie-gluesenkamp-perez-wa",
  "john-braun-wa",
  // House 04 [heuristic]: Amanda McKinney (R), John Duresky (I)
  "amanda-mckinney-wa",
  "john-duresky-wa",
  // House 05 [heuristic]: Michael James Baumgartner (R), Carmela Conroy (I)
  "michael-james-baumgartner-wa",
  "carmela-conroy-wa",
  // House 06 [heuristic]: Emily Randall (I)
  "emily-randall-wa",
  // House 07 [heuristic]: Pramila Jayapal (I)
  "pramila-jayapal-wa",
  // House 08 [heuristic]: Kim Schrier (I), Trinh Ha (R)
  "kim-schrier-wa",
  "trinh-ha-wa",
  // House 09 [heuristic]: David Adam "Adam" Smith (I), Douglas Michael "Doug" Basler (R)
  "david-adam-adam-smith-wa",
  "douglas-michael-doug-basler-wa",
  // House 10 [heuristic]: Marilyn Strickland (I)
  "marilyn-strickland-wa",

  // ================ WV ================
  // House 01 [heuristic]: Britta "Brit" Aguirre (D), Carol Devine Miller (R)
  "britta-brit-aguirre-wv",
  "carol-devine-miller-wv",
  // House 02 [heuristic]: Ahsan "Ace" Parsi (D), Riley McGowan Moore (R)
  "ahsan-ace-parsi-wv",
  "riley-mcgowan-moore-wv",
  // Senate [heuristic]: Zachary Chase "Zach" Shrewsbury (D), Shelley Moore Capito (R)
  "zachary-chase-zach-shrewsbury-wv",
  "shelley-moore-capito-wv",
]);
