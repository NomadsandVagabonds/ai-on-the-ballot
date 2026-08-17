/**
 * TEMPORARY general-election demo seed. DELETE THIS FILE AT GO-LIVE.
 *
 * Slugs of candidates presumed to be on the November 2026 ballot, used by
 * selectRaceCandidates() ONLY for races where no candidate carries the
 * in_general_election flag from the sheet. The moment a race's winners
 * are marked via the sheet's "general" column and republished, the sheet
 * data wins for that race and this seed is ignored there.
 *
 * Accuracy: Senate nominees verified against 2026 primary results
 * (TX runoff: Paxton d. Cornyn, faces Talarico; IL: Stratton vs Tracy).
 * House races use a heuristic (incumbent, else each major party's top
 * fundraiser; third parties only above $50k raised) pending editorial
 * review. California is absent from this snapshot and keeps the
 * primary-field view until marked in the sheet.
 */
export const GENERAL_ELECTION_SEED: ReadonlySet<string> = new Set([
  // AR House 01: Terri Yarbrough Green (D), Eric Alan "Rick" Crawford (R)
  "terri-yarbrough-green-ar",
  "eric-alan-crawford-ar",
  // AR House 02: Christopher Michael Jones (D), James French Hill (R)
  "christopher-michael-jones-ar",
  "james-french-hill-ar",
  // AR House 03: Robb Ryerse (D), Stephen Womack (R)
  "robb-ryerse-ar",
  "stephen-womack-ar",
  // AR House 04: James "Rus" Russell III (D), Bruce Westerman (R)
  "james-russell-iii-ar",
  "bruce-westerman-ar",
  // AR Senate: Hallie Shoffner (D), Thomas B. Cotton (R)
  "hallie-shoffner-ar",
  "thomas-b-cotton-ar",
  // IL House 01: Jonathan L. Jackson (D), Christian Maxwell (R)
  "jonathan-l-jackson-il",
  "christian-maxwell-il",
  // IL House 02: Donna Miller (D), Michael Scott "Mike" Noack (R)
  "donna-miller-il",
  "michael-scott-noack-il",
  // IL House 03: Delia C. Ramirez (D), Angel Oakley (R)
  "delia-c-ramirez-il",
  "angel-oakley-il",
  // IL House 04: Patty García (D), Lupe Castillo (R), Mayra Macías (I)
  "patty-garcia-il",
  "lupe-castillo-il",
  "mayra-macias-il",
  // IL House 05: Mike Quigley (D), Tom "Tommy" Hanson (R)
  "mike-quigley-il",
  "tom-hanson-il",
  // IL House 06: Sean Casten (D), Niki Conforti (R)
  "sean-casten-il",
  "niki-conforti-il",
  // IL House 07: La Shawn K. Ford (D), Chad Koppie Sr. (R)
  "la-shawn-k-ford-il",
  "chad-koppie-sr-il",
  // IL House 08: Melissa Luburich Bean (D), Jennifer Davis (R)
  "melissa-luburich-bean-il",
  "jennifer-davis-il",
  // IL House 09: Daniel Biss (D), John Elleson (R)
  "daniel-biss-il",
  "john-elleson-il",
  // IL House 10: Bradley Scott "Brad" Schneider (D), Carl Lambrecht (R)
  "bradley-scott-schneider-il",
  "carl-lambrecht-il",
  // IL House 11: G. William "Bill" Foster (D), Jeffrey D. "Jeff" Walter (R)
  "g-william-foster-il",
  "jeffrey-d-walter-il",
  // IL House 12: Julie Fortier (D), Michael J. "Mike" Bost (R)
  "julie-fortier-il",
  "michael-j-bost-il",
  // IL House 13: Nikki Budzinski (D), Jeff Wilson (R)
  "nikki-budzinski-il",
  "jeff-wilson-il",
  // IL House 14: Lauren A. Underwood (D), James Thomas "Jim" Marter (R)
  "lauren-a-underwood-il",
  "james-thomas-marter-il",
  // IL House 15: Jennifer Ann Todd (D), Mary E. Miller (R)
  "jennifer-ann-todd-il",
  "mary-e-miller-il",
  // IL House 16: Paul Nolley (D), Darin McKay LaHood (R)
  "paul-nolley-il",
  "darin-mckay-lahood-il",
  // IL House 17: Eric Sorensen (D), Dillan S. Vancil (R)
  "eric-sorensen-il",
  "dillan-s-vancil-il",
  // IL Senate: Juliana Stratton (D), Donald R. "Don" Tracy (R)
  "juliana-stratton-il",
  "donald-r-tracy-il",
  // IN House 01: Frank J. Mrvan (D), Barb Regnitz (R)
  "frank-j-mrvan-in",
  "barb-regnitz-in",
  // IN House 02: Jamee Decio (D), Rudolph C. Yakym III (R)
  "jamee-decio-in",
  "rudolph-c-yakym-iii-in",
  // IN House 03: Kelly Elizabeth Thompson (D), Marlin A. Stutzman (R)
  "kelly-elizabeth-thompson-in",
  "marlin-a-stutzman-in",
  // IN House 04: James R. Baird (R)
  "james-r-baird-in",
  // IN House 05: James David Ford (D), Victoria Spartz (R)
  "james-david-ford-in",
  "victoria-spartz-in",
  // IN House 06: Cynthia Wirth (D), Jefferson Shreve (R)
  "cynthia-wirth-in",
  "jefferson-shreve-in",
  // IN House 07: André D. Carson (D)
  "andre-d-carson-in",
  // IN House 08: Mary Theresa Allen (D), Mark Messmer (R)
  "mary-theresa-allen-in",
  "mark-messmer-in",
  // IN House 09: Timothy "Tim" Peck (D), Erin Houchin (R)
  "timothy-peck-in",
  "erin-houchin-in",
  // MS House 01: James Clifton "Cliff" Johnson III (D), John Trent "Trent" Kelly (R)
  "james-clifton-johnson-iii-ms",
  "john-trent-kelly-ms",
  // MS House 02: Bennie G. Thompson (D), Ron Eller (R)
  "bennie-g-thompson-ms",
  "ron-eller-ms",
  // MS House 03: Michael Alexis Chiaradio (D), Michael Patrick Guest (R)
  "michael-alexis-chiaradio-ms",
  "michael-patrick-guest-ms",
  // MS House 04: Jeffrey Hulum III (D), Walter Michael "Mike" Ezell (R)
  "jeffrey-hulum-iii-ms",
  "walter-michael-ezell-ms",
  // MS Senate: Scott Colom (D), Cindy Hyde-Smith (R), Tyrone Pinkins (I)
  "scott-colom-ms",
  "cindy-hyde-smith-ms",
  "tyrone-pinkins-ms",
  // NC House 01: Donald Gene Davis (D), Laurie Gaye Moe Buckhout (R)
  "donald-gene-davis-nc",
  "laurie-gaye-moe-buckhout-nc",
  // NC House 02: Deborah Koff Ross (D), Eugene Farley Douglass (R)
  "deborah-koff-ross-nc",
  "eugene-farley-douglass-nc",
  // NC House 03: Raymond Edward Smith, Jr. (D), Gregory Francis "Greg" Murphy (R)
  "raymond-edward-smith-jr-nc",
  "gregory-francis-murphy-nc",
  // NC House 04: Valerie Paige Foushee (D), Mahesh Aychut "Max" Ganorkar (R)
  "valerie-paige-foushee-nc",
  "mahesh-aychut-ganorkar-nc",
  // NC House 05: Charles Noble "Chuck" Hubbard (D), Virginia Ann Foxx (R), David Clayton (I)
  "charles-noble-hubbard-nc",
  "virginia-ann-foxx-nc",
  "david-clayton-nc",
  // NC House 06: Cyril Anthony Jefferson (D), Addison Parker McDowell (R)
  "cyril-anthony-jefferson-nc",
  "addison-parker-mcdowell-nc",
  // NC House 07: Kimberly Michelle Hardy (D), David Cheston Rouzer (R)
  "kimberly-michelle-hardy-nc",
  "david-cheston-rouzer-nc",
  // NC House 08: Colby Lawrence Watson (D), Mark Everette Harris (R)
  "colby-lawrence-watson-nc",
  "mark-everette-harris-nc",
  // NC House 09: Richard Neece Ojeda, II (D), Richard Lane Hudson, Jr. (R)
  "richard-neece-ojeda-ii-nc",
  "richard-lane-hudson-jr-nc",
  // NC House 10: Ashley Thrasher Bell (D), Patrick Luke "Pat" Harrigan (R)
  "ashley-thrasher-bell-nc",
  "patrick-luke-harrigan-nc",
  // NC House 11: James Peterson "Jamie" Ager (D), Charles Marion "Chuck" Edwards (R)
  "james-peterson-ager-nc",
  "charles-marion-edwards-nc",
  // NC House 12: Alma Shealey Adams (D), John Christopher "Jack" Codiga (R)
  "alma-shealey-adams-nc",
  "john-christopher-codiga-nc",
  // NC House 13: Paul Jehu Barringer, III (D), John Bradford "Brad" Knott (R)
  "paul-jehu-barringer-iii-nc",
  "john-bradford-knott-nc",
  // NC House 14: LaKesha Shanese Womack (D), Timothy Keith "Tim" Moore (R)
  "lakesha-shanese-womack-nc",
  "timothy-keith-moore-nc",
  // NC Senate: Roy Asberry Cooper III (D), Michael David Whatley (R)
  "roy-asberry-cooper-iii-nc",
  "michael-david-whatley-nc",
  // OH House 01: Greg Landsman (D), Eric Conroy (R)
  "greg-landsman-oh",
  "eric-conroy-oh",
  // OH House 02: David "Dave" J. Taylor (R)
  "david-j-taylor-oh",
  // OH House 03: Joyce B. Beatty (D)
  "joyce-b-beatty-oh",
  // OH House 04: James "Jim" D. Jordan (R)
  "james-d-jordan-oh",
  // OH House 05: Robert Edward Latta (R)
  "robert-edward-latta-oh",
  // OH House 06: Adrian J. Vitus (D), Michael A. Rulli (R)
  "adrian-j-vitus-oh",
  "michael-a-rulli-oh",
  // OH House 07: Edward O'Donnell Fitzgerald (D), Max Miller (R)
  "edward-o-donnell-fitzgerald-oh",
  "max-miller-oh",
  // OH House 08: Madaris Grant (D), Warren Davidson (R)
  "madaris-grant-oh",
  "warren-davidson-oh",
  // OH House 09: Marcia Carolyn Kaptur (D), Derek Merrin (R)
  "marcia-carolyn-kaptur-oh",
  "derek-merrin-oh",
  // OH House 10: Tony Pombo (D), Michael R. Turner (R)
  "tony-pombo-oh",
  "michael-r-turner-oh",
  // OH House 11: Shontel M. Brown (D)
  "shontel-m-brown-oh",
  // OH House 12: Jerrad Shane Christian (D), William Troy Balderson (R)
  "jerrad-shane-christian-oh",
  "william-troy-balderson-oh",
  // OH House 13: Emilia Sykes (D), Niranjan "Neil" Patel (R)
  "emilia-sykes-oh",
  "niranjan-patel-oh",
  // OH House 14: Maria Jukic (D), David P. Joyce (R)
  "maria-jukic-oh",
  "david-p-joyce-oh",
  // OH House 15: Adam Clay Miller (D), Mike Carey (R)
  "adam-clay-miller-oh",
  "mike-carey-oh",
  // OH Senate: Sherrod Brown (D), Jon A. Husted (R)
  "sherrod-brown-oh",
  "jon-a-husted-oh",
  // TX House 01: Nathan Quentin Moran (D)
  "nathan-quentin-moran-tx",
  // TX House 02: Shaun Finnie (D), Steve Toth (R)
  "shaun-finnie-tx",
  "steve-toth-tx",
  // TX House 03: Evan Hunt (D), Keith Self (R)
  "evan-hunt-tx",
  "keith-self-tx",
  // TX House 04: Jason Pearce (D), Pat Fallon (R)
  "jason-pearce-tx",
  "pat-fallon-tx",
  // TX House 05: Ruth "Truth" Torres (D), Lance Gooden (R)
  "ruth-torres-tx",
  "lance-gooden-tx",
  // TX House 06: Danny Minton (D), John Kevin "Jake" Ellzey (R)
  "danny-minton-tx",
  "john-kevin-ellzey-tx",
  // TX House 07: Elizabeth Pannill Fletcher (D), Alexander Hale (R)
  "elizabeth-pannill-fletcher-tx",
  "alexander-hale-tx",
  // TX House 08: Laura Jones (D), Jessica Steinmann (R)
  "laura-jones-tx",
  "jessica-steinmann-tx",
  // TX House 09: Leticia Gutierrez (D), Alexandra Mealer (R)
  "leticia-gutierrez-tx",
  "alexandra-mealer-tx",
  // TX House 10: Caitlin McClay Rourk (D), Chris Gober (R)
  "caitlin-mcclay-rourk-tx",
  "chris-gober-tx",
  // TX House 11: Claire Reynolds (D), August Pfluger (R)
  "claire-reynolds-tx",
  "august-pfluger-tx",
  // TX House 12: Angela "Heli" Rodriguez Prillman (D), Craig Goldman (R)
  "angela-rodriguez-prillman-tx",
  "craig-goldman-tx",
  // TX House 13: Mark Nair (D), Ronny Lynn Jackson (R)
  "mark-nair-tx",
  "ronny-lynn-jackson-tx",
  // TX House 14: Richard Harvey Davis III (D), Randy Weber (R)
  "richard-harvey-davis-iii-tx",
  "randy-weber-tx",
  // TX House 15: Bobby Pulido (D), Monica De La Cruz-Hernandez (R)
  "bobby-pulido-tx",
  "monica-de-la-cruz-hernandez-tx",
  // TX House 16: Veronica Escobar (D), Manuel Barraza (R)
  "veronica-escobar-tx",
  "manuel-barraza-tx",
  // TX House 17: Casey Shepard (D), Peter Andrew Sessions (R)
  "casey-shepard-tx",
  "peter-andrew-sessions-tx",
  // TX House 18: Alexander Green (D), Ronald Dwayne Whitfield (R)
  "alexander-green-tx",
  "ronald-dwayne-whitfield-tx",
  // TX House 19: Kyle Rable (D), Tom Sell (R)
  "kyle-rable-tx",
  "tom-sell-tx",
  // TX House 20: Joaquin Castro (D), Edgardo Rafael Baez (R)
  "joaquin-castro-tx",
  "edgardo-rafael-baez-tx",
  // TX House 21: Kristin Hook (D), Mark Teixeira (R)
  "kristin-hook-tx",
  "mark-teixeira-tx",
  // TX House 22: Marquette Greene-Scott (D), Trever Nehls (R)
  "marquette-greene-scott-tx",
  "trever-nehls-tx",
  // TX House 23: Katy Padilla Stout (D), Brandon Herrera (R)
  "katy-padilla-stout-tx",
  "brandon-herrera-tx",
  // TX House 24: Kevin Burge (D), Elizabeth Ann Van Duyne (R)
  "kevin-burge-tx",
  "elizabeth-ann-van-duyne-tx",
  // TX House 25: Dione Sims (D), Roger Williams (R)
  "dione-sims-tx",
  "roger-williams-tx",
  // TX House 26: Steven Shook (D), Brandon Gill (R)
  "steven-shook-tx",
  "brandon-gill-tx",
  // TX House 27: Tanya Lloyd (D), Michael Cloud (R)
  "tanya-lloyd-tx",
  "michael-cloud-tx",
  // TX House 28: Henry Cuellar (D), Tano E. Tijerina (R)
  "henry-cuellar-tx",
  "tano-e-tijerina-tx",
  // TX House 29: Sylvia Garcia (D), Martha Elena Fierro (R)
  "sylvia-garcia-tx",
  "martha-elena-fierro-tx",
  // TX House 30: Frederick Haynes (D), Sholdon Daniels (R)
  "frederick-haynes-tx",
  "sholdon-daniels-tx",
  // TX House 31: Justin Early (D), John Carter (R)
  "justin-early-tx",
  "john-carter-tx",
  // TX House 32: Dan Barrios (D), Jace Yarbrough (R)
  "dan-barrios-tx",
  "jace-yarbrough-tx",
  // TX House 33: Colin Allred (D), Patrick David Gillspie (R)
  "colin-allred-tx",
  "patrick-david-gillspie-tx",
  // TX House 34: Vicente Gonzalez (D), Eric D. Flores (R)
  "vicente-gonzalez-tx",
  "eric-d-flores-tx",
  // TX House 35: Johnny C. Garcia (D), John Lujan (R)
  "johnny-c-garcia-tx",
  "john-lujan-tx",
  // TX House 36: Rhonda Hart (D), Brian Babin (R)
  "rhonda-hart-tx",
  "brian-babin-tx",
  // TX House 37: Gregorio Casar (D), Lauren Pena (R)
  "gregorio-casar-tx",
  "lauren-pena-tx",
  // TX House 38: Melissa McDonough (D), Jon Bonck (R)
  "melissa-mcdonough-tx",
  "jon-bonck-tx",
  // TX Senate: Warren Kenneth Paxton (R), James Talarico (D)
  "warren-kenneth-paxton-tx",
  "james-talarico-tx",
]);
