export type EventTier = 'highlight' | 'minor';

export interface TimelineSource {
	label: string;
	url: string;
}

export interface TimelineEvent {
	date: string;
	year: number;
	title: string;
	description: string;
	tag: string;
	tier: EventTier;
	sources?: TimelineSource[];
}

export interface TimelineGap {
	id: string;
	afterHighlightYear: number;
	beforeHighlightYear: number;
	label: string;
	minorEvents: TimelineEvent[];
}

const lmgtfySource = (query: string): TimelineSource => ({
	label: 'LMGTFY',
	url: `https://lmgtfy.com/?q=${encodeURIComponent(query)}`,
});

const minor = (
	date: string,
	year: number,
	title: string,
	description: string,
	tag: string,
): TimelineEvent => ({
	date,
	year,
	title,
	description,
	tag,
	tier: 'minor',
	sources: [lmgtfySource(`Trump ${title} ${year}`)],
});

const highlight = (
	date: string,
	year: number,
	title: string,
	description: string,
	tag: string,
	sources?: TimelineSource[],
): TimelineEvent => ({
	date,
	year,
	title,
	description,
	tag,
	tier: 'highlight',
	...(sources ? { sources } : {}),
});

export const HIGHLIGHT_EVENTS: TimelineEvent[] = [
	highlight(
		'May 1989',
		1989,
		'The Central Park Five Ads',
		'Took out full-page ads in four major NYC newspapers calling for the return of the death penalty for five Black and Latino teenagers who were later fully exonerated by DNA evidence.',
		'Survived It',
		[
			{
				label: 'New York Times — Central Park Five exoneration context',
				url: 'https://www.nytimes.com/2019/02/27/opinion/trump-central-park-five.html',
			},
		],
	),
	highlight(
		'April 2011',
		2011,
		'The Birther Conspiracy',
		'Became the loudest mainstream voice pushing the racist conspiracy theory that President Barack Obama was not born in the United States, forcing the White House to release the long-form birth certificate.',
		'Gained Traction',
		[
			{
				label: 'White House — Long-form birth certificate release',
				url: 'https://obamawhitehouse.archives.gov/blog/2011/04/27/president-obamas-long-form-birth-certificate',
			},
		],
	),
	highlight(
		'June 2015',
		2015,
		'The Escalator Announcement',
		'Descended a golden escalator and announced his candidacy by broadly characterizing Mexican immigrants as criminals and "rapists."',
		'Won the Primary',
		[
			{
				label: 'New York Times — Campaign announcement',
				url: 'https://www.nytimes.com/2015/06/17/us/politics/donald-trump-announces-2016-presidential-bid.html',
			},
		],
	),
	highlight(
		'July 2015',
		2015,
		'John McCain Comments',
		'Dismissed the service of Senator John McCain, a former POW who spent years being tortured in Vietnam, saying: "He\'s not a war hero... I like people who weren\'t captured."',
		'Polls Went Up',
		[
			{
				label: 'New York Times — McCain war hero remarks',
				url: 'https://www.nytimes.com/2015/07/19/us/politics/trump-says-mccain-is-not-a-war-hero.html',
			},
		],
	),
	highlight(
		'November 2015',
		2015,
		'Mocking a Disabled Reporter',
		'Floundered his arms and altered his voice during a rally in South Carolina to mock the physical disability of New York Times reporter Serge Kovaleski.',
		'Still Survived',
		[
			{
				label: 'New York Times — Rally mockery of Serge Kovaleski',
				url: 'https://www.nytimes.com/2015/11/27/us/politics/donald-trump-says-hes-mocking-new-york-times-reporter-not-his-disability.html',
			},
		],
	),
	highlight(
		'October 2016',
		2016,
		'The Access Hollywood Tape',
		'A 2005 hot-mic recording leaked showing him bragging to Billy Bush about being able to sexually assault women with impunity because "when you\'re a star, they let you do it."',
		'Won The Presidency',
		[
			{
				label: 'Washington Post — Access Hollywood recording',
				url: 'https://www.washingtonpost.com/politics/trump-recorded-having-extremely-lewd-conversation-about-women-in-2005/2016/10/07/3b037ce4-8caf-11e6-bf8a-3d26847eeed4_story.html',
			},
		],
	),
	highlight(
		'August 2017',
		2017,
		'Charlottesville',
		'Following a deadly white supremacist rally in Virginia, stated in a press conference that there was "blame on both sides" and that there were "very fine people, on both sides."',
		'Moved On',
		[
			{
				label: 'NPR — Transcript of Trump\'s remarks',
				url: 'https://www.npr.org/2017/08/12/543085099/transcript-trumps-comments-on-white-supremacists-protests-in-charlottesville',
			},
		],
	),
	highlight(
		'July 2018',
		2018,
		'The Helsinki Summit',
		'Stood next to Vladimir Putin on the world stage and publicly sided with the Russian President over his own US intelligence agencies regarding 2016 election interference.',
		'Ignored Backlash',
		[
			{
				label: 'New York Times — Helsinki press conference',
				url: 'https://www.nytimes.com/2018/07/16/world/europe/trump-putin-helsinki-summit.html',
			},
		],
	),
	highlight(
		'December 2019',
		2019,
		'The First Impeachment',
		'Impeached for abuse of power after attempting to extort Ukrainian President Zelenskyy by withholding military aid in exchange for a manufactured investigation into a political rival.',
		'Acquitted',
		[
			{
				label: 'House Intelligence Committee — Impeachment inquiry report',
				url: 'https://intelligence.house.gov/report/',
			},
		],
	),
	highlight(
		'April 2020',
		2020,
		'The Bleach Comments',
		'During a televised live COVID-19 task force briefing, suggested that scientists should look into injecting household disinfectant or UV light inside the body to cure the virus.',
		'Survived It',
		[
			{
				label: 'NPR — Disinfectant briefing remarks',
				url: 'https://www.npr.org/sections/coronavirus-live-updates/2020/04/24/844415209/trump-suggests-injecting-disinfectant-as-treatment-for-coronavirus',
			},
		],
	),
	highlight(
		'June 2020',
		2020,
		'Lafayette Square',
		'Had federal law enforcement use tear gas and rubber bullets to violently clear peaceful civil rights protestors so he could walk across the street and hold a bible upside down in front of a church.',
		'Moved On',
		[
			{
				label: 'NPR — Clearing of Lafayette Square',
				url: 'https://www.npr.org/2020/06/02/872410670/protesters-gassed-outside-white-house-so-trump-could-pose-at-church',
			},
		],
	),
	highlight(
		'January 6, 2021',
		2021,
		'The Capitol Riot',
		'Summoned a mob to Washington, told them to "fight like hell," and watched on TV for hours as they violently breached the US Capitol to stop the certification of the election.',
		'Acquitted Again',
		[
			{
				label: 'Select Committee — Final report on the January 6 attack',
				url: 'https://www.govinfo.gov/collection/january-6th-committee-final-report',
			},
		],
	),
	highlight(
		'August 2022',
		2022,
		'Mar-a-Lago Raid',
		'The FBI executed a search warrant at his golf club, recovering dozens of highly classified national security documents he had taken and refused to return, leading to federal indictment.',
		'Kept Running',
		[
			{
				label: 'Department of Justice — Mar-a-Lago search warrant affidavit (redacted)',
				url: 'https://www.justice.gov/storage/mar-a-lago-search-warrant-application-and-affidavit-redacted.pdf',
			},
		],
	),
	highlight(
		'May 2024',
		2024,
		'34 Felony Convictions',
		'Found guilty by a jury of his peers on 34 felony counts of falsifying business records to cover up hush-money payments to a porn star right before the 2016 election.',
		'Still Here',
		[
			{
				label: 'New York Times — Hush-money trial verdict',
				url: 'https://www.nytimes.com/2024/05/30/nyregion/trump-guilty-verdict-hush-money-trial.html',
			},
		],
	),
	highlight(
		'February 2025',
		2025,
		'Picking a Fight with Canada',
		'Slapped 25% tariffs on Canadian imports, mused about making Canada the 51st state, and turned the world\'s longest undefended border into a trade war — against America\'s closest ally.',
		'Still Here',
		[
			{
				label: 'Reuters — U.S. tariffs on Canada and Mexico',
				url: 'https://www.reuters.com/world/us/trump-imposes-25-tariffs-canada-mexico-2025-02-01/',
			},
		],
	),
];

export const TIMELINE_GAPS: TimelineGap[] = [
	{
		id: '1989-2011',
		afterHighlightYear: 1989,
		beforeHighlightYear: 2011,
		label: '1989 → 2011',
		minorEvents: [
			minor(
				'1991',
				1991,
				'Trump Taj Mahal Bankruptcy',
				'Opened what was then the world\'s largest casino and drove it into bankruptcy within a year — his fourth corporate bankruptcy overall.',
				'Dodged It',
			),
			minor(
				'1992',
				1992,
				'Marla Maples Affair Goes Public',
				'The affair with Marla Maples became tabloid front-page news while he was still married to Ivana Trump. The divorce settlement and publicity barely dented his brand.',
				'No Consequences',
			),
			minor(
				'1995',
				1995,
				'Lost Nearly $1 Billion in One Year',
				'Leaked tax records later showed he reported losses of $915.7 million in 1995 — more than nearly any other American taxpayer that year. He still sold himself as a business genius.',
				'Forgotten',
			),
			minor(
				'2005',
				2005,
				'Access Hollywood Tape Recorded',
				'Bragged about sexual assault on a hot mic years before it would leak during the 2016 campaign. The tape sat dormant for over a decade.',
				'Buried',
			),
			minor(
				'2006',
				2006,
				'Trump University Launches',
				'Started a real-estate seminar operation that would later face lawsuits from students alleging fraud and a $25 million settlement — years after the damage was done.',
				'Dodged It',
			),
			minor(
				'2009',
				2009,
				'"John Baron" Calls to Press',
				'Repeatedly posed as his own publicist "John Baron" (and "John Barron") in calls to journalists, bragging about himself in the third person. The tapes eventually surfaced. Nobody cared enough to stop him.',
				'Forgotten',
			),
		],
	},
	{
		id: '2011-2015',
		afterHighlightYear: 2011,
		beforeHighlightYear: 2015,
		label: '2011 → 2015',
		minorEvents: [
			minor(
				'April 2011',
				2011,
				'Obama Roasts Him at Correspondents\' Dinner',
				'President Obama and Seth Meyers humiliated him on stage for ten minutes straight while he sat stone-faced in the audience. Widely reported as the moment he decided to run for president out of spite.',
				'Backfired Globally',
			),
			minor(
				'2012',
				2012,
				'Election Night Meltdown',
				'Tweeted that the election was a "total sham and a travesty" and called for a revolution when Obama won re-election. Deleted the tweets. Moved on.',
				'Dodged It',
			),
			minor(
				'2012',
				2012,
				'$5 Million Birther Stunt',
				'Offered $5 million to charity if Obama released college and passport records. Obama ignored it. The stunt kept him in the news instead.',
				'No Consequences',
			),
			minor(
				'2014',
				2014,
				'Scottish Wind Farm Feud',
				'Lost a years-long legal battle against an offshore wind farm near his Aberdeen golf course, then claimed victory anyway. The course opened regardless.',
				'Forgotten',
			),
		],
	},
	{
		id: '2015-escalator-mccain',
		afterHighlightYear: 2015,
		beforeHighlightYear: 2015,
		label: 'Escalator → McCain',
		minorEvents: [
			minor(
				'August 2015',
				2015,
				'Feud with Fox News & Megyn Kelly',
				'Boycotted a Fox News debate after Kelly confronted him about misogynistic comments. His poll numbers rose. Fox eventually capitulated.',
				'Polls Went Up',
			),
			minor(
				'August 2015',
				2015,
				'"Blood Coming Out of Her Wherever"',
				'Said of Megyn Kelly after the debate: "You could see there was blood coming out of her eyes, blood coming out of her wherever." Denied it meant what everyone heard.',
				'Dodged It',
			),
			minor(
				'September 2015',
				2015,
				'Failed to Correct "Obama Is Muslim" Questioner',
				'At a town hall in New Hampshire, a supporter said "We have a problem in this country: it\'s called Muslims." He replied: "We\'re going to be looking at that."',
				'No Consequences',
			),
		],
	},
	{
		id: '2015-mccain-reporter',
		afterHighlightYear: 2015,
		beforeHighlightYear: 2015,
		label: 'McCain → Disabled Reporter',
		minorEvents: [
			minor(
				'November 2015',
				2015,
				'Retweeted False Black-on-White Crime Stats',
				'Shared a graphic with fabricated crime statistics from a neo-Nazi account. When called out, said "Am I gonna check every statistic?" and kept campaigning.',
				'Dodged It',
			),
			minor(
				'December 2015',
				2015,
				'Muslim Ban Proposal',
				'Called for a "total and complete shutdown of Muslims entering the United States." Condemned worldwide. Primary voters loved it.',
				'Polls Went Up',
			),
			minor(
				'July 2016',
				2016,
				'Attacked Gold Star Parents Khizr and Ghazala Khan',
				'After the Khans spoke at the DNC about their son killed in Iraq, he mocked them and implied Ghazala Khan wasn\'t "allowed" to speak. Veterans groups condemned him.',
				'Still Survived',
			),
		],
	},
	{
		id: '2015-reporter-2016',
		afterHighlightYear: 2015,
		beforeHighlightYear: 2016,
		label: 'Disabled Reporter → Access Hollywood',
		minorEvents: [
			minor(
				'March 2016',
				2016,
				'Refused to Disavow David Duke / KKK',
				'Claimed he didn\'t know who David Duke was and couldn\'t disavow the Klan without knowing more. Later blamed a "bad earpiece."',
				'Dodged It',
			),
			minor(
				'July 2016',
				2016,
				'"Russia, If You\'re Listening"',
				'Publicly asked Russia to hack Hillary Clinton\'s emails during a press conference. Later claimed he was joking.',
				'Forgotten',
			),
			minor(
				'October 2016',
				2016,
				'Three Accusers Press Conference',
				'Hours before the second debate, held a press conference with women accusing Bill Clinton of misconduct — deflecting from his own Access Hollywood tape.',
				'Still Survived',
			),
		],
	},
	{
		id: '2016-2017',
		afterHighlightYear: 2016,
		beforeHighlightYear: 2017,
		label: 'Access Hollywood → Charlottesville',
		minorEvents: [
			minor(
				'October 2016',
				2016,
				'"Nasty Woman"',
				'Called Hillary Clinton "such a nasty woman" during the final presidential debate. Became a feminist rallying cry — and a meme that helped normalize the insult.',
				'No Consequences',
			),
			minor(
				'October 2016',
				2016,
				'Refused to Commit to Accepting Election Results',
				'When asked if he would accept the outcome, said: "I will look at it at the time." He won anyway.',
				'Forgotten',
			),
			minor(
				'January 2017',
				2017,
				'Inauguration Crowd Size Lies',
				'Sent Sean Spicer to lie about inauguration crowd sizes on day one, then displayed doctored photos. Set the tone for the entire administration.',
				'Dodged It',
			),
		],
	},
	{
		id: '2017-2018',
		afterHighlightYear: 2017,
		beforeHighlightYear: 2018,
		label: 'Charlottesville → Helsinki',
		minorEvents: [
			minor(
				'September 2017',
				2017,
				'Puerto Rico Paper Towel Toss',
				'After Hurricane Maria devastated Puerto Rico, tossed paper towels into a crowd like prizes and said the death toll wasn\'t "a real catastrophe like Katrina."',
				'Moved On',
			),
			minor(
				'September 2017',
				2017,
				'Called NFL Players "Son of a Bitch"',
				'Demanded NFL owners fire players who kneeled during the anthem. The feud dominated headlines for weeks. Ratings debate continues.',
				'Forgotten',
			),
			minor(
				'October 2017',
				2017,
				'Tillerson "Moron" Reports',
				'Secretary of State Rex Tillerson reportedly called him a "moron" after a national security meeting. Tillerson never fully denied it. Both stayed in their jobs for months.',
				'No Consequences',
			),
		],
	},
	{
		id: '2018-2019',
		afterHighlightYear: 2018,
		beforeHighlightYear: 2019,
		label: 'Helsinki → Impeachment',
		minorEvents: [
			minor(
				'August 2018',
				2018,
				'Cohen Implicates Him in Court',
				'Michael Cohen pleaded guilty and testified under oath that Trump directed him to commit campaign finance violations. Trump called Cohen a "rat."',
				'Dodged It',
			),
			minor(
				'September 2018',
				2018,
				'Sharpie Hurricane Map',
				'Altered a NOAA hurricane forecast map with a Sharpie to falsely show Alabama in Dorian\'s path, then doubled down for days rather than admit a mistake.',
				'Forgotten',
			),
			minor(
				'April 2019',
				2019,
				'Mueller Report Released',
				'The Mueller report documented multiple instances of potential obstruction of justice. He declared "total exoneration" and the phrase stuck in his base.',
				'No Consequences',
			),
		],
	},
	{
		id: '2019-2020',
		afterHighlightYear: 2019,
		beforeHighlightYear: 2020,
		label: 'Impeachment → Bleach',
		minorEvents: [
			minor(
				'October 2019',
				2019,
				'Ukraine Transcript Released',
				'Released a summary of his call with Zelenskyy that showed him asking for a "favor" investigating the Bidens. He called it "perfect."',
				'Dodged It',
			),
			minor(
				'November 2019',
				2019,
				'Marie Yovanovitch Intimidation',
				'Tweeted attacks on Ambassador Yovanovitch while she testified live during impeachment hearings. Witness intimidation in plain sight.',
				'No Consequences',
			),
			minor(
				'February 2020',
				2020,
				'Roger Stone Commutation',
				'Commuted the sentence of his longtime ally convicted of lying to Congress and witness tampering. Stone had refused to implicate him.',
				'Forgotten',
			),
		],
	},
	{
		id: '2020-bleach-lafayette',
		afterHighlightYear: 2020,
		beforeHighlightYear: 2020,
		label: 'Bleach → Lafayette Square',
		minorEvents: [
			minor(
				'May 2020',
				2020,
				'Hydroxychloroquine Promotion',
				'Pushed an unproven malaria drug as a COVID cure despite FDA warnings. Said he was taking it himself. Studies later showed it didn\'t work and could be harmful.',
				'Dodged It',
			),
			minor(
				'May 2020',
				2020,
				'"When the Looting Starts, the Shooting Starts"',
				'Tweeted the phrase coined by a racist Miami police chief during 1967 riots. Twitter hid the tweet for glorifying violence.',
				'No Consequences',
			),
			minor(
				'May 2020',
				2020,
				'Bunker Photo',
				'Reports that Secret Service rushed him to the White House bunker during protests. He later claimed he was "inspecting" it. Became a meme. Didn\'t matter.',
				'Forgotten',
			),
		],
	},
	{
		id: '2020-lafayette-jan6',
		afterHighlightYear: 2020,
		beforeHighlightYear: 2021,
		label: 'Lafayette Square → Jan 6',
		minorEvents: [
			minor(
				'September 2020',
				2020,
				'"Stand Back and Stand By" to Proud Boys',
				'Told the Proud Boys to "stand back and stand by" during a debate. The group treated it as a recruitment slogan.',
				'Still Survived',
			),
			minor(
				'November 2020',
				2020,
				'Fired Chris Krebs for Saying Election Was Secure',
				'Fired the CISA director via tweet for calling the 2020 election "the most secure in American history." Krebs became a hero; Trump kept lying.',
				'Dodged It',
			),
			minor(
				'November 2020',
				2020,
				'Four Seasons Total Landscaping Presser',
				'Rudy Giuliani held a press conference at a landscaping company between a sex shop and a crematorium, not the Four Seasons hotel. Became instant comedy. The coup attempt continued.',
				'Forgotten',
			),
		],
	},
	{
		id: '2021-2022',
		afterHighlightYear: 2021,
		beforeHighlightYear: 2022,
		label: 'Jan 6 → Mar-a-Lago',
		minorEvents: [
			minor(
				'January 2021',
				2021,
				'Second Impeachment',
				'Impeached a second time — the only president impeached twice — for inciting the Capitol riot. Acquitted again after leaving office.',
				'Acquitted',
			),
			minor(
				'February 2021',
				2021,
				'Classified Docs at Mar-a-Lago Reports',
				'Reports emerged that he took boxes of classified material to Mar-a-Lago. The National Archives would spend over a year trying to get them back.',
				'Buried',
			),
			minor(
				'July 2021',
				2021,
				'Sued by Letitia James (Initially)',
				'NY Attorney General announced a civil investigation into his business practices that would eventually seek $450 million in penalties. He kept running.',
				'Kept Running',
			),
		],
	},
	{
		id: '2022-2024',
		afterHighlightYear: 2022,
		beforeHighlightYear: 2024,
		label: 'Mar-a-Lago → Felony Convictions',
		minorEvents: [
			minor(
				'May 2023',
				2023,
				'E. Jean Carroll Verdict',
				'Found liable for sexual abuse and defamation. Ordered to pay $5 million. Called it a "disgrace" and kept campaigning.',
				'Dodged It',
			),
			minor(
				'August 2023',
				2023,
				'Fulton County Indictment',
				'Indicted along with 18 co-conspirators for attempting to overturn Georgia\'s 2020 election results. Mugshot became merchandise.',
				'Still Here',
			),
			minor(
				'October 2023',
				2023,
				'Gag Order Violations',
				'Repeatedly violated gag orders in the hush-money case, triggering fines. Kept posting attacks on witnesses and the judge from Truth Social.',
				'No Consequences',
			),
			minor(
				'May 2024',
				2024,
				'$454 Million Civil Fraud Judgment',
				'NY judge ordered him to pay $454 million for inflating his net worth for decades. Posted a reduced bond and appealed. Still the GOP nominee.',
				'Still Here',
			),
		],
	},
	{
		id: '2024-2025',
		afterHighlightYear: 2024,
		beforeHighlightYear: 2025,
		label: 'Felony Convictions → Canada',
		minorEvents: [
			minor(
				'January 2025',
				2025,
				'"Gulf of America" Executive Order',
				'Renamed the Gulf of Mexico by executive order on day one. Mexico and the entire geography of the planet declined to comply.',
				'Dodged It',
			),
			minor(
				'January 2025',
				2025,
				'Panama Canal Grabbing Talk',
				'Threatened to retake the Panama Canal. Panama said no. The story lasted a news cycle.',
				'Forgotten',
			),
			minor(
				'February 2025',
				2025,
				'"51st State" Rhetoric',
				'Repeatedly referred to Canada as a candidate for statehood and Trudeau as a "governor." Canadians responded with memes, maple syrup, and a moose.',
				'No Consequences',
			),
			minor(
				'March 2025',
				2025,
				'Retaliatory Canadian Tariffs',
				'Canada hit back with targeted tariffs on American whiskey, orange juice, and other symbolic goods. He called it an act of aggression.',
				'Still Here',
			),
		],
	},
];

/** @deprecated Use getAllEvents() or getHighlightEvents() */
export const TIMELINE_EVENTS = HIGHLIGHT_EVENTS;

export function getHighlightEvents(): TimelineEvent[] {
	return HIGHLIGHT_EVENTS;
}

export function getTimelineGaps(): TimelineGap[] {
	return TIMELINE_GAPS;
}

export function getMinorEvents(): TimelineEvent[] {
	return TIMELINE_GAPS.flatMap((gap) => gap.minorEvents);
}

export function getAllEvents(): TimelineEvent[] {
	return [...HIGHLIGHT_EVENTS, ...getMinorEvents()];
}

export function getHighlightCount(): number {
	return HIGHLIGHT_EVENTS.length;
}

export function getTotalEventCount(): number {
	return getAllEvents().length;
}

/** @deprecated Use getHighlightCount() or getTotalEventCount() */
export function getEventCount(): number {
	return getTotalEventCount();
}

export function getYearSpan(): { start: number; end: number } {
	const years = getAllEvents().map((e) => e.year);
	return { start: Math.min(...years), end: Math.max(...years) };
}

export function getTagCounts(): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const event of getAllEvents()) {
		counts.set(event.tag, (counts.get(event.tag) ?? 0) + 1);
	}
	return Array.from(counts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

export function getEventsByDecade(): { decade: string; label: string; count: number }[] {
	const decades = [
		{ decade: '1980s', label: '80s', start: 1980, end: 1989 },
		{ decade: '1990s', label: '90s', start: 1990, end: 1999 },
		{ decade: '2000s', label: '00s', start: 2000, end: 2009 },
		{ decade: '2010s', label: '10s', start: 2010, end: 2019 },
		{ decade: '2020s', label: '20s', start: 2020, end: 2029 },
	];
	const allEvents = getAllEvents();
	return decades.map(({ decade, label, start, end }) => ({
		decade,
		label,
		count: allEvents.filter((e) => e.year >= start && e.year <= end).length,
	}));
}

export function getMaxTagCount(): number {
	return Math.max(...getTagCounts().map((t) => t.count), 1);
}

export function getMaxDecadeCount(): number {
	return Math.max(...getEventsByDecade().map((d) => d.count), 1);
}

export function getGapForHighlightIndex(index: number): TimelineGap | undefined {
	if (index >= HIGHLIGHT_EVENTS.length - 1) return undefined;
	return TIMELINE_GAPS[index];
}
