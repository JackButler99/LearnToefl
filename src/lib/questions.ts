export type Section = "listening" | "structure" | "reading";
export type Question = {
  id: string;
  section: Section;
  kind: "audio" | "cloze" | "error" | "passage";
  stimulus: string;
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
  group?: string;
};
export type PublicQuestion = Omit<Question, "answer" | "explanation">;

type Item = [string, string, [string, string, string, string], number, string];
const item = (section: Section, kind: Question["kind"], prefix: string, rows: Item[]): Question[] =>
  rows.map(([stimulus, prompt, options, answer, explanation], index) => ({
    id: `${prefix}-${index + 1}`, section, kind, stimulus, prompt, options, answer, explanation,
  }));

const dialogues: Item[] = [
  ["Woman: The library closes at six today. Man: Then I should return these books before my afternoon class.", "What does the man plan to do?", ["Return books before class", "Study until six", "Borrow more books", "Cancel his class"], 0, "He says he should return the books before his class."],
  ["Man: Did you print the handouts? Woman: The printer ran out of paper, so I sent everyone a digital copy.", "What did the woman do?", ["Bought paper", "Emailed the handouts", "Canceled the meeting", "Repaired the printer"], 1, "She sent a digital copy instead of printing."],
  ["Woman: The lecture was scheduled for room 204. Man: It was moved to the auditorium because so many people registered.", "Where is the lecture now?", ["Room 204", "The library", "The auditorium", "The cafeteria"], 2, "The man identifies the new venue as the auditorium."],
  ["Man: I thought the report was due Friday. Woman: The professor extended the deadline to Monday.", "When is the report due?", ["Thursday", "Friday", "Sunday", "Monday"], 3, "The new deadline is Monday."],
  ["Woman: Are you taking the bus to campus? Man: I usually do, but my bicycle is working again.", "How will the man probably travel?", ["By bicycle", "By bus", "By train", "On foot"], 0, "He contrasts his usual bus trip with his repaired bicycle."],
  ["Man: The museum tour begins at ten. Woman: We had better arrive fifteen minutes early to pick up our tickets.", "When should they arrive?", ["At ten fifteen", "At nine forty-five", "At nine fifteen", "At eleven"], 1, "Fifteen minutes before ten is nine forty-five."],
  ["Woman: Your presentation slides look finished. Man: Almost. I still need to check the references.", "What must the man do?", ["Choose a topic", "Add photographs", "Check references", "Book a room"], 2, "He explicitly says he needs to check the references."],
  ["Man: Did you find the biology textbook? Woman: The campus shop sold out, but the library has a copy on reserve.", "Where can the woman use the book?", ["At the campus shop", "In a laboratory", "At home", "At the library"], 3, "The library has the reserve copy."],
  ["Woman: I cannot attend the workshop on Tuesday. Man: There is another session on Thursday with the same instructor.", "What does the man suggest?", ["Attend on Thursday", "Meet a different instructor", "Skip the workshop", "Come on Wednesday"], 0, "He mentions the alternative Thursday session."],
  ["Man: The cafeteria is unusually quiet. Woman: Most students are at the annual science fair.", "Why is the cafeteria quiet?", ["It is closed", "Students are at the fair", "Classes have ended", "Lunch is delayed"], 1, "The woman explains where most students are."],
  ["Woman: Will the research assistant start today? Man: She called to say her train was delayed, so she will arrive tomorrow.", "When will the assistant arrive?", ["This morning", "Tonight", "Tomorrow", "Next week"], 2, "The train delay shifts her arrival to tomorrow."],
  ["Man: The blue notebook is five dollars. Woman: I need two, but I only have enough money for one today.", "How many notebooks will the woman buy today?", ["Three", "Two", "None", "One"], 3, "She has enough money for one notebook."],
  ["Woman: The elevator is out of service. Man: Fortunately, the seminar is only on the second floor.", "What will they probably do?", ["Use the stairs", "Cancel the seminar", "Wait for repairs", "Move to the first floor"], 0, "The nearby second floor suggests taking the stairs."],
  ["Man: I left my umbrella in the classroom. Woman: The building is still open; you can go back for it.", "What does the woman advise?", ["Buy an umbrella", "Return to the classroom", "Call the teacher", "Wait outside"], 1, "She suggests going back while the building is open."],
  ["Woman: Have you finished the chemistry assignment? Man: I completed the calculations, but I have not written the conclusion.", "What remains to be done?", ["The calculations", "The introduction", "The conclusion", "The experiment"], 2, "The man has not written the conclusion."],
  ["Man: The train leaves at eight thirty. Woman: We can catch it if we leave the dormitory now.", "What does the woman imply?", ["The train has left", "They should stay", "The dormitory is closed", "They should depart immediately"], 3, "She says they can catch the train if they leave now."],
  ["Woman: Is Dr. Lee in her office? Man: She is meeting a student, but she should be free in ten minutes.", "What should the woman do?", ["Wait about ten minutes", "Go to another office", "Cancel her appointment", "Meet a student"], 0, "Dr. Lee should be available shortly."],
  ["Man: I reserved a table for four. Woman: Two classmates cannot come, so we only need seats for two.", "How many people will attend?", ["Four", "Two", "Three", "Five"], 1, "Two classmates canceled, leaving two attendees."],
  ["Woman: The new computer lab opens next month. Man: That is good news; the current lab is always crowded.", "What does the man say about the current lab?", ["It is closed", "It is new", "It is crowded", "It is far away"], 2, "He describes the current lab as always crowded."],
  ["Man: Did the professor approve your topic? Woman: Yes, but she asked me to narrow it to one century.", "What must the woman change?", ["Her professor", "Her deadline", "Her sources", "The scope of her topic"], 3, "Narrowing to one century reduces the topic's scope."],
  ["Woman: The concert tickets are free for students. Man: Then I will bring my student card to the box office.", "What will the man bring?", ["His student card", "Cash", "A printed ticket", "A friend"], 0, "He says he will bring his student card."],
  ["Man: I cannot find the statistics notes. Woman: I uploaded mine to the course website last night.", "Where are the notes?", ["In the classroom", "On the course website", "At the bookstore", "In the mailbox"], 1, "The woman uploaded her notes online."],
  ["Woman: Should we study outside? Man: The forecast calls for rain, so the student center would be better.", "Where does the man prefer to study?", ["Outside", "At home", "In the student center", "At the station"], 2, "The student center avoids the expected rain."],
  ["Man: I missed the first part of the lecture. Woman: The instructor posts recordings after every class.", "What can the man use?", ["A textbook", "A written exam", "A classmate's ticket", "A lecture recording"], 3, "The posted recording can help him catch up."],
  ["Woman: The laboratory closes at five. Man: I only need twenty more minutes to finish the measurements.", "What does the man need?", ["Twenty more minutes", "A new instrument", "Another day", "Five assistants"], 0, "He needs twenty minutes for the remaining measurements."],
];

type Talk = { script: string; questions: [string, [string, string, string, string], number, string][] };
const talks: Talk[] = [
  { script: "Speaker: Welcome to the university garden. Volunteers planted native flowers here three years ago. These plants need less water than imported flowers and attract local bees. Students measure bee visits every Friday morning. The garden is open to visitors every afternoon, but research plots must not be entered.", questions: [
    ["What is the talk mainly about?", ["A university garden", "A sports field", "A library collection", "A music program"], 0, "The speaker introduces the university garden."],
    ["When were the flowers planted?", ["Last month", "Three years ago", "Five years ago", "This morning"], 1, "The speaker states three years ago."],
    ["What do native flowers attract?", ["Birds", "Students", "Local bees", "Imported plants"], 2, "They attract local bees."],
    ["When are bee visits measured?", ["Monday evening", "Daily", "Sunday afternoon", "Friday morning"], 3, "The measurements take place Friday mornings."],
    ["What are visitors asked to avoid?", ["Entering research plots", "Taking photographs", "Coming in the afternoon", "Looking at flowers"], 0, "Research plots must not be entered."],
  ]},
  { script: "Speaker: The campus shuttle will use a new route starting Monday. It will stop at the north residence hall before the engineering building. Service begins at seven in the morning and ends at nine at night. Buses arrive every fifteen minutes during the day. Students can check the current position of each bus on the university website.", questions: [
    ["What change is being announced?", ["A new exam schedule", "A new shuttle route", "A building closure", "A tuition discount"], 1, "The announcement describes a new shuttle route."],
    ["When does the change begin?", ["Friday", "Saturday", "Monday", "Wednesday"], 2, "It starts Monday."],
    ["Which stop comes before the engineering building?", ["The library", "The stadium", "The hospital", "The north residence hall"], 3, "The residence hall comes first."],
    ["When does service end?", ["Nine at night", "Seven in the morning", "Noon", "Midnight"], 0, "Service ends at 9 p.m."],
    ["Where can students locate a bus?", ["At the ticket office", "On the university website", "In the library", "At the north gate"], 1, "The website shows bus positions."],
  ]},
  { script: "Speaker: Today we will discuss how astronomers measure distant stars. A star appears dimmer as its distance increases, but its true brightness also matters. One useful group, called standard candles, has a known intrinsic brightness. By comparing this with the light observed from Earth, scientists can estimate distance. This method works best when dust does not block the light.", questions: [
    ["What is the lecture about?", ["The age of planets", "Types of dust", "Measuring star distances", "Building telescopes"], 2, "The lecture explains distance measurement."],
    ["What happens to a star's apparent brightness as distance increases?", ["It increases", "It remains fixed", "It changes color", "It decreases"], 3, "More distant stars appear dimmer."],
    ["What is known about standard candles?", ["Their intrinsic brightness", "Their exact age", "Their temperature", "Their color"], 0, "Their true brightness is known."],
    ["What is compared with intrinsic brightness?", ["A star's mass", "Light observed from Earth", "The number of planets", "Telescope size"], 1, "Astronomers compare the observed light."],
    ["What can interfere with the method?", ["Wind", "Clouds on Earth", "Dust blocking light", "Earth's oceans"], 2, "Dust can obstruct the light."],
  ]},
  { script: "Speaker: The history department has acquired a collection of handwritten letters from local merchants. The letters date from the early nineteenth century and describe trade along the river. They are fragile, so researchers will use digital scans instead of handling the originals. An exhibition of selected scans opens next month. The department hopes the collection will help students examine everyday economic life.", questions: [
    ["What has the department acquired?", ["Maps", "Photographs", "Paintings", "Handwritten letters"], 3, "The collection consists of letters."],
    ["When were the letters written?", ["In the early nineteenth century", "Last year", "In the sixteenth century", "Next month"], 0, "The speaker dates the letters to the early nineteenth century."],
    ["What do the letters describe?", ["University courses", "River trade", "Foreign languages", "Mountain travel"], 1, "They describe trade along the river."],
    ["Why will researchers use digital scans?", ["The originals were lost", "Scans are cheaper", "The originals are fragile", "The letters are blank"], 2, "Handling the fragile originals could damage them."],
    ["When will the exhibition open?", ["Today", "Tomorrow", "Next year", "Next month"], 3, "The exhibit opens next month."],
  ]},
  { script: "Speaker: Several species of sea turtle travel long distances to lay eggs on sandy beaches. Newly hatched turtles usually move toward the brightest natural horizon, which is the ocean. Artificial lights near a beach can draw them in the wrong direction. Conservation teams therefore ask nearby buildings to dim lights during hatching season. Volunteers also record the number of nests without touching the eggs.", questions: [
    ["What is the talk mainly about?", ["Sea turtle nesting", "Ocean currents", "Beach construction", "Fishing equipment"], 0, "The talk focuses on nesting turtles."],
    ["Where do the turtles lay eggs?", ["In deep water", "On sandy beaches", "In forests", "On rocks"], 1, "They lay eggs on beaches."],
    ["What guides newly hatched turtles naturally?", ["Warm sand", "Wind", "The bright ocean horizon", "Adult turtles"], 2, "They move toward the brightest natural horizon."],
    ["What can lead the hatchlings astray?", ["Rain", "Waves", "Trees", "Artificial lights"], 3, "Artificial lighting can misdirect them."],
    ["What do volunteers record?", ["The number of nests", "The weight of eggs", "The water temperature", "The names of visitors"], 0, "Volunteers count nests without touching eggs."],
  ]},
];

const listening: Question[] = [
  ...item("listening", "audio", "L", dialogues),
  ...talks.flatMap((talk, talkIndex) => talk.questions.map(([prompt, options, answer, explanation], questionIndex) => ({
    id: `LT-${talkIndex + 1}-${questionIndex + 1}`, section: "listening" as const, kind: "audio" as const,
    stimulus: talk.script, prompt, options, answer, explanation, group: `talk-${talkIndex + 1}`,
  }))),
];

const cloze: Item[] = [
  ["The professor ___ the results before submitting the article.", "Choose the best completion.", ["review", "reviewed", "reviewing", "to review"], 1, "A completed past action takes the simple past form."],
  ["Neither the students nor the instructor ___ aware of the change.", "Choose the best completion.", ["were", "are", "was", "have"], 2, "With neither ... nor, the verb agrees with the nearer singular subject."],
  ["The samples were stored in a room ___ temperature remained constant.", "Choose the best completion.", ["whose", "that", "which", "where"], 0, "Whose modifies the room's temperature."],
  ["___ the heavy rain, the field trip continued as planned.", "Choose the best completion.", ["Although", "Despite", "Because", "Unless"], 1, "Despite introduces the noun phrase 'the heavy rain'."],
  ["The research team has worked on the project ___ 2021.", "Choose the best completion.", ["for", "during", "since", "from"], 2, "Since is followed by a starting point."],
  ["The more carefully the data are collected, ___ the findings become.", "Choose the best completion.", ["reliable", "most reliable", "reliably", "the more reliable"], 3, "Correlative comparatives use 'the more ... the more ...'."],
  ["A microscope enables scientists ___ tiny structures.", "Choose the best completion.", ["to observe", "observing", "observed", "observe"], 0, "Enable someone to do something is the standard construction."],
  ["The committee postponed its decision until all reports ___ available.", "Choose the best completion.", ["become", "became", "becoming", "to become"], 1, "The past narrative calls for 'became'."],
  ["The archive contains documents ___ back several centuries.", "Choose the best completion.", ["date", "dated", "dating", "dates"], 2, "The participle 'dating' modifies documents."],
  ["Hardly had the lecture begun ___ the fire alarm rang.", "Choose the best completion.", ["than", "while", "until", "when"], 3, "Hardly ... when is the standard pair."],
  ["Each of the proposed solutions ___ a different advantage.", "Choose the best completion.", ["has", "have", "having", "are"], 0, "Each is singular."],
  ["The device is designed ___ energy consumption.", "Choose the best completion.", ["reduce", "to reduce", "reducing", "reduced"], 1, "Designed to do something expresses purpose."],
  ["The collection includes paintings, photographs, ___ sculptures.", "Choose the best completion.", ["or", "but", "and", "so"], 2, "And joins the final item in a list."],
  ["Only after the experiment ended ___ the equipment cleaned.", "Choose the best completion.", ["did", "has", "were", "was"], 3, "Inversion after 'Only after' yields 'was the equipment cleaned'."],
  ["The article, ___ appeared in May, attracted considerable attention.", "Choose the best completion.", ["which", "that", "who", "where"], 0, "A nonrestrictive clause uses 'which' between commas."],
  ["If the weather improves, the researchers ___ the survey tomorrow.", "Choose the best completion.", ["conducted", "will conduct", "conducting", "had conducted"], 1, "A real future conditional uses will in the main clause."],
  ["Few animals can survive in an environment ___ dry.", "Choose the best completion.", ["such", "too much", "so", "enough"], 2, "So modifies the adjective dry."],
  ["The director requested that every visitor ___ a badge.", "Choose the best completion.", ["wears", "wore", "wearing", "wear"], 3, "The subjunctive after requested that uses the base form."],
  ["The village is located ___ the eastern side of the island.", "Choose the best completion.", ["on", "at", "in", "by"], 0, "A location on a side is described with 'on'."],
  ["Researchers are interested in how quickly the material ___ heat.", "Choose the best completion.", ["conduct", "conducts", "conducting", "conducted"], 1, "The singular material takes 'conducts'."],
];

// Each sentence contains exactly one deliberately incorrect labeled span.
const errors: Item[] = [
  ["The [A: results] [B: was] [C: published] [D: yesterday].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Plural results requires were."],
  ["[A: Each] of the samples [B: were] [C: examined] [D: carefully].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Each is singular and takes was."],
  ["The researchers [A: have] [B: completed] the [C: experiment] [D: last night].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 0, "A definite past time requires completed, not have completed."],
  ["The book [A: that] she [B: borrowed] is [C: more older] than [D: mine].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "Older is already comparative; remove more."],
  ["[A: Although] the road was [B: narrow], the bus [C: arrived] [D: safety].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 3, "The adverb safely is needed after arrived."],
  ["The scientist [A: explained] the procedure [B: clear] to [C: the] [D: students].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Explained needs the adverb clearly."],
  ["The [A: museum] [B: opens] at nine [C: in] [D: Mondays].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "Days take the preposition on."],
  ["[A: Neither] answer [B: are] [C: completely] [D: correct].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Neither answer is singular and takes is."],
  ["The manager [A: asked] us [B: to arrive] [C: earlier] [D: as possible].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "The expression is 'as early as possible'."],
  ["They [A: discussed] [B: about] the proposal [C: during] the [D: meeting].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Discuss takes a direct object without about."],
  ["The [A: ancient] tools [B: were found] [C: beneath] the [D: soils].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 3, "Soil is uncountable here."],
  ["She [A: has lived] in the town [B: since] [C: three] [D: years].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "A duration uses for three years."],
  ["The laboratory [A: contains] [B: several] [C: new] [D: equipments].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 3, "Equipment is uncountable."],
  ["The students [A: were] [B: interested] [C: on] the [D: lecture].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "The phrase is interested in."],
  ["The city [A: has] [B: fewer] parks [C: then] the neighboring [D: town].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "A comparison uses than, not then."],
  ["[A: When] the machine [B: stopped], the technician [C: examine] it [D: immediately].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "The past narrative requires examined."],
  ["The [A: report] was [B: written] [C: by] [D: they].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 3, "After by, use the object pronoun them."],
  ["[A: Many] visitors [B: prefers] the [C: quieter] [D: gallery].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Plural visitors takes prefer."],
  ["The professor [A: suggested] [B: to review] the notes [C: before] [D: class].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 1, "Suggested is followed by reviewing or a that-clause."],
  ["This [A: method] is [B: the] [C: most efficient] of [D: the two].", "Which labeled part must be changed?", ["A", "B", "C", "D"], 2, "Of two alternatives, use the comparative more efficient."],
];

const structure: Question[] = [
  ...item("structure", "cloze", "S", cloze),
  ...item("structure", "error", "E", errors),
];

type ReadingSet = { title: string; passage: string; questions: [string, [string, string, string, string], number, string][] };
const readingSets: ReadingSet[] = [
  { title: "Urban Heat", passage: "Cities often remain warmer than nearby rural areas after sunset. Dark roofs and pavement absorb sunlight during the day and release stored heat at night. Buildings may also slow the movement of cooling winds. Researchers call this pattern the urban heat island effect. Trees help by providing shade and releasing water vapor. Some cities paint roofs pale colors so that they reflect more sunlight. These measures can lower the need for air conditioning, especially during summer. However, their effectiveness varies with local climate and building design.", questions: [
    ["What is the passage mainly about?", ["Why cities can be warmer and how to reduce the heat", "The history of air conditioning", "How winds form over oceans", "The cost of rural housing"], 0, "It describes urban heat islands and mitigation."],
    ["When is the temperature difference especially noticeable?", ["At dawn", "After sunset", "During rain", "In winter only"], 1, "The first sentence says after sunset."],
    ["Which surfaces absorb sunlight?", ["Rivers and lakes", "Glass windows", "Dark roofs and pavement", "White paint"], 2, "The passage names dark roofs and pavement."],
    ["What may buildings slow?", ["Traffic", "Cloud formation", "Tree growth", "Cooling winds"], 3, "Buildings may slow cooling winds."],
    ["What is this temperature pattern called?", ["The urban heat island effect", "A sea breeze", "Thermal erosion", "The greenhouse layer"], 0, "The passage gives the term urban heat island effect."],
    ["How do trees help?", ["By absorbing pavement", "By providing shade and releasing water vapor", "By painting roofs", "By blocking rain"], 1, "Both mechanisms are stated."],
    ["Why are some roofs painted pale colors?", ["To make them heavier", "To store more heat", "To reflect more sunlight", "To stop wind"], 2, "Pale roofs reflect sunlight."],
    ["What can these measures reduce?", ["The number of buildings", "Rural temperatures", "Sunlight", "The need for air conditioning"], 3, "The text directly states this benefit."],
    ["What affects how well these measures work?", ["Local climate and building design", "Only the number of residents", "Only the time of day", "The age of nearby rivers"], 0, "The final sentence gives both factors."],
    ["The word 'effectiveness' is closest to", ["size", "success", "cost", "location"], 1, "Effectiveness means how well something works."],
  ]},
  { title: "The Making of Paper", passage: "Early paper makers mixed plant fibers with water and spread the mixture over a screen. When the water drained, a thin layer of fibers remained. The sheet was then pressed and dried. This process produced a lighter writing surface than many earlier materials. As paper making spread, workshops adapted local plants and tools. The quality of a sheet depended on fiber length, preparation, and drying conditions. Modern mills use machines to repeat many of the same basic stages on a larger scale. Recycled paper adds another step: used sheets are broken down and cleaned before new sheets are formed.", questions: [
    ["What is the main subject?", ["The production of paper", "The invention of ink", "The history of screens", "Modern printing"], 0, "The passage outlines paper making."],
    ["What did early makers first combine?", ["Ink and wood", "Plant fibers and water", "Sand and oil", "Clay and leaves"], 1, "They mixed plant fibers with water."],
    ["What remained after water drained?", ["A metal screen", "A pile of tools", "A thin layer of fibers", "A dried book"], 2, "A layer of fibers remained."],
    ["What happened after the sheet formed?", ["It was painted", "It was recycled", "It was cut into strips", "It was pressed and dried"], 3, "The text lists pressing and drying."],
    ["What advantage did paper offer?", ["A lighter writing surface", "A waterproof surface", "A harder surface", "An edible material"], 0, "Paper was lighter than many earlier materials."],
    ["What did workshops adapt?", ["Ocean routes", "Local plants and tools", "Language rules", "Weather forecasts"], 1, "The passage names local plants and tools."],
    ["Which factor affected sheet quality?", ["Market size", "Ink color", "Fiber length", "Book covers"], 2, "Fiber length is listed among quality factors."],
    ["How do modern mills differ?", ["They avoid fibers", "They use only recycled water", "They skip drying", "They work on a larger scale"], 3, "Modern mills scale up basic stages."],
    ["What happens to used sheets in recycling?", ["They are broken down and cleaned", "They are burned immediately", "They become screens", "They are pressed without cleaning"], 0, "They are broken down and cleaned first."],
    ["The word 'adapted' is closest to", ["ignored", "adjusted", "removed", "recorded"], 1, "Adapted means adjusted to local conditions."],
  ]},
  { title: "Migrating Birds", passage: "Many birds travel between breeding and wintering areas each year. The length of these journeys varies considerably by species. Some birds navigate partly by the position of the sun, while others also use stars or Earth's magnetic field. Weather can change a route: strong winds may help a bird fly farther or force it to rest. Before departure, many species build up stores of fat that provide energy during flight. Wetlands along a migration route are important resting and feeding places. When these habitats disappear, birds may have fewer safe places to recover before continuing their journeys.", questions: [
    ["What is the main topic?", ["Bird migration and its challenges", "The biology of fish", "Mountain formation", "The history of flight"], 0, "The passage discusses bird journeys and obstacles."],
    ["Where do migrating birds travel?", ["Only to wetlands", "Between breeding and wintering areas", "Only to mountains", "Between cities"], 1, "The first sentence specifies these areas."],
    ["What varies by species?", ["The color of stars", "The size of wetlands", "Journey length", "The speed of wind"], 2, "Journey length varies considerably."],
    ["Which natural cue can guide birds?", ["Ocean salinity", "Buildings", "Cloud names", "The position of the sun"], 3, "The sun is one stated navigation cue."],
    ["What can strong winds do?", ["Help travel or force a rest", "Remove the magnetic field", "Create wetlands", "Prevent fat storage"], 0, "Wind can help or interrupt a journey."],
    ["What provides flight energy?", ["Stored water", "Stored fat", "Feathers alone", "Sand"], 1, "Fat stores provide energy."],
    ["Why are wetlands important?", ["They change Earth's orbit", "They cause strong winds", "They offer rest and food", "They stop navigation"], 2, "Wetlands are resting and feeding places."],
    ["What may happen when wetlands disappear?", ["Journeys become shorter by law", "Birds stop breeding", "All winds weaken", "Safe resting places become scarce"], 3, "Habitat loss removes places to recover."],
    ["Which inference is supported?", ["Protecting wetlands can aid migration", "Every species follows the same route", "Birds never travel at night", "Fat stores are unnecessary"], 0, "Wetlands support birds in transit."],
    ["The word 'considerably' is closest to", ["rarely", "greatly", "briefly", "secretly"], 1, "Considerably means to a great extent."],
  ]},
  { title: "Coastal Archaeology", passage: "Archaeologists studying ancient coastal settlements often find shells, pottery, and stone tools. Layers of sediment can show that a place was occupied at different times. A shell found near a hearth may provide evidence about food, but it cannot alone reveal everything people ate. Scientists therefore compare several kinds of evidence. Coastlines also change as sea levels rise or fall, so a settlement that was once beside the water may now be inland or underwater. Careful maps and dating methods help researchers reconstruct how people lived in a changing environment.", questions: [
    ["What is the passage mainly about?", ["Studying ancient coastal settlements", "Modern harbor construction", "Ocean weather forecasts", "Manufacturing stone tools"], 0, "It explains evidence and challenges in coastal archaeology."],
    ["Which object might archaeologists find?", ["Plastic toys", "Pottery", "Modern batteries", "Steel trains"], 1, "Pottery is explicitly mentioned."],
    ["What can sediment layers indicate?", ["The number of oceans", "Future weather", "Occupation at different times", "A tool's price"], 2, "Different layers can reveal successive occupation."],
    ["What may a shell near a hearth suggest?", ["A sea-level measurement", "A building's height", "A map error", "Something about food"], 3, "Its position may provide food evidence."],
    ["Why compare kinds of evidence?", ["A single find has limits", "All shells are identical", "Maps cannot be drawn", "Pottery cannot be dated"], 0, "One item cannot explain every aspect of life."],
    ["What changes coastal positions?", ["The color of shells", "Rising or falling sea levels", "Tool size", "Museum hours"], 1, "Sea level changes the coastline."],
    ["Where might a former coastal settlement be today?", ["Only in a museum", "Only on a mountain", "Inland or underwater", "Always in the same place"], 2, "The passage names both locations."],
    ["What helps reconstruct past life?", ["Only shells", "Only guesses", "Modern traffic records", "Maps and dating methods"], 3, "Maps and dating are named."],
    ["Which inference is reasonable?", ["Present geography may differ from ancient geography", "Coastlines never move", "Archaeologists avoid comparing evidence", "Sea level is always constant"], 0, "Changing coastlines imply a different past landscape."],
    ["The word 'reconstruct' is closest to", ["destroy", "piece together", "forget", "hide"], 1, "Researchers piece together past conditions."],
  ]},
  { title: "Community Radio", passage: "Community radio stations often serve a specific town or neighborhood. Unlike larger networks, they may invite local residents to suggest programs or report events. A station might broadcast school announcements, interviews with artists, and information during emergencies. Volunteers commonly help produce shows, although staff members still manage equipment and scheduling. Digital streaming lets a local station reach listeners outside its immediate area. However, the station's strongest value may remain its close relationship with the community it serves and its ability to address issues overlooked by national broadcasters.", questions: [
    ["What is the main subject?", ["The role of community radio", "Television history", "Music copyright", "Satellite engineering"], 0, "The passage discusses local radio's activities and value."],
    ["Whom does a community station typically serve?", ["Only tourists", "A particular town or neighborhood", "Only national officials", "Only engineers"], 1, "A specific community is stated."],
    ["Who may suggest programs?", ["Only advertisers", "Only staff", "Local residents", "Only national networks"], 2, "Residents may suggest programming."],
    ["Which information might be broadcast?", ["Private bank passwords", "Weather from another planet", "Train engineering formulas", "School announcements"], 3, "School announcements are one example."],
    ["Who commonly helps produce shows?", ["Volunteers", "Only actors", "Only reporters from abroad", "Only scientists"], 0, "Volunteers commonly help."],
    ["What do staff members manage?", ["Town elections", "Equipment and scheduling", "All schools", "Only interviews"], 1, "The passage identifies their responsibilities."],
    ["What does digital streaming allow?", ["A station to avoid sound", "The end of local news", "Listeners beyond the local area", "No need for equipment"], 2, "Streaming extends the audience."],
    ["What might be the station's greatest strength?", ["Its national advertising", "Its size", "Its expensive studio", "Its close community relationship"], 3, "The passage emphasizes local connection."],
    ["What issues may national broadcasters overlook?", ["Local issues", "All emergencies", "All sports", "Every school"], 0, "Local matters may be overlooked nationally."],
    ["The word 'immediate' is closest to", ["future", "nearby", "dangerous", "imaginary"], 1, "Immediate area means nearby area."],
  ]},
];

const reading: Question[] = readingSets.flatMap((set, setIndex) => set.questions.map(([prompt, options, answer, explanation], questionIndex) => ({
  id: `R-${setIndex + 1}-${questionIndex + 1}`, section: "reading" as const, kind: "passage" as const,
  stimulus: `${set.title}\n\n${set.passage}`, prompt, options, answer, explanation, group: `passage-${setIndex + 1}`,
})));

export const QUESTIONS = [...listening, ...structure, ...reading];
export const COUNTS = { listening: 50, structure: 40, reading: 50 } as const;
if (listening.length !== 50 || structure.length !== 40 || reading.length !== 50) {
  throw new Error("Question bank does not match the Level 1 blueprint");
}

export const getQuestions = (mode: "full" | "practice", section?: Section) => {
  if (mode === "full") return QUESTIONS;
  if (section === "listening") return [...listening.slice(0, 5), ...listening.slice(25, 30)];
  if (section === "structure") return [...structure.slice(0, 5), ...structure.slice(20, 25)];
  if (section === "reading") return [...reading.slice(0, 5), ...reading.slice(10, 15)];
  return [];
};

export const publicQuestion = ({ answer: _answer, explanation: _explanation, ...question }: Question): PublicQuestion => question;
