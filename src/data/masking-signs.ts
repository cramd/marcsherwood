export interface MaskingSign {
	id: number;
	title: string;
	text: string;
}

export const MASKING_SIGNS: MaskingSign[] = [
	{
		id: 30,
		title: 'Using default phrases for every situation',
		text: "Relying on go-to responses ('that's interesting', 'sounds good') to fill silences when processing.",
	},
	{
		id: 29,
		title: "Laughing at jokes you don't get",
		text: 'Fake laughing just to blend in and avoid standing out or being questioned.',
	},
	{
		id: 28,
		title: 'Avoiding phone calls and texting later',
		text: 'Avoiding live phone calls due to sensory overload and miscommunication anxiety.',
	},
	{
		id: 27,
		title: "Avoiding 'weird' or special-interest topics",
		text: 'Suppressing your true passions during small talk to stick to standard subjects like the weather.',
	},
	{
		id: 26,
		title: 'Pretending not to notice sensory overload',
		text: 'Acting unaffected by buzzing lights, strong smells, or noises while internally overwhelmed.',
	},
	{
		id: 25,
		title: "Pretending you're listening",
		text: 'Nodding, forcing eye contact, or posing thoughtfully when your brain has completely zoned out.',
	},
	{
		id: 24,
		title: "Practicing 'normal' reactions in the mirror",
		text: 'Rehearsing facial expressions, smiles, or relaxed body language so they appear natural.',
	},
	{
		id: 23,
		title: "Mimicking other people's facial expressions",
		text: 'Mirroring expressions to match expectations, even with a slight delay in processing.',
	},
	{
		id: 22,
		title: 'Preparing backup conversation topics',
		text: 'Entering social situations with a mental deck of pre-planned conversation scripts.',
	},
	{
		id: 21,
		title: 'Eating food you hate to avoid awkwardness',
		text: 'Forcing down disliked food textures or flavors to avoid seeming difficult or rude.',
	},
	{
		id: 20,
		title: 'Rehearsing conversations in advance',
		text: 'Mentally playing out every possible script or outcome before entering a conversation.',
	},
	{
		id: 19,
		title: 'Wearing sensory-unfriendly clothes',
		text: 'Tolerating uncomfortable fabrics, tight clothing, or itchy tags just to fit fashion norms.',
	},
	{
		id: 18,
		title: 'Over-explaining everything',
		text: 'Giving excessive details out of deep anxiety that people will misunderstand your intent.',
	},
	{
		id: 17,
		title: 'Changing your voice to match the situation',
		text: 'Shifting pitch, tone, or adopting a professional/customer-service voice consciously.',
	},
	{
		id: 16,
		title: 'Overthinking every social interaction',
		text: 'Ruminating on past conversations and analyzing whether you said something wrong or weird.',
	},
	{
		id: 15,
		title: 'Faking interest in small talk',
		text: 'Engaging in superficial chatter despite having zero genuine interest in the topic.',
	},
	{
		id: 14,
		title: 'Suppressing stimming in public',
		text: 'Holding back physical repetitive movements (leg bouncing, rocking) to avoid judgment.',
	},
	{
		id: 13,
		title: 'Replaying conversations on an endless loop',
		text: 'Worrying if your mask slipped or over-analyzing why someone gave you a strange look.',
	},
	{
		id: 12,
		title: "Feeling like you're acting all the time",
		text: 'Experiencing daily social life like performing in a play where you were never given the script.',
	},
	{
		id: 11,
		title: 'Not losing it when misunderstood',
		text: 'Forcing composure when people misread your flat tone or direct communication as rude or mad.',
	},
	{
		id: 10,
		title: 'Suppressing meltdowns or shutdowns until alone',
		text: 'Holding in extreme overload until you reach a safe, private space to implode or erupt.',
	},
	{
		id: 9,
		title: "Pretending to be fine when you're definitely not",
		text: "Defaulting to 'I'm fine' on autopilot because explaining takes far too much energy.",
	},
	{
		id: 8,
		title: 'Avoiding social events but going anyway',
		text: 'Forcing yourself to show up exhausted because canceling or explaining feels even worse.',
	},
	{
		id: 7,
		title: 'Monitoring tone, volume, and word choice constantly',
		text: 'Running an intense internal audit on whether you are being too loud, too quiet, or direct.',
	},
	{
		id: 6,
		title: 'Rephrasing everything to be softer and less blunt',
		text: "Running your thoughts through an internal 'politeness filter' before speaking.",
	},
	{
		id: 5,
		title: 'Following a mental social checklist',
		text: 'Manually tracking eye contact, posture, timing, and contributions in real time.',
	},
	{
		id: 4,
		title: "Dominating conversations because it's easier",
		text: "Controlling the narrative so you don't have to navigate pauses or unpredictable cues.",
	},
	{
		id: 3,
		title: 'Being in constant fight-or-flight mode',
		text: 'Remaining on high alert for social missteps, sudden routine changes, or sensory overload.',
	},
	{
		id: 2,
		title: "Feeling like you're in a world not built for you",
		text: 'Feeling like an alien navigating hidden rules that everyone else seems to grasp naturally.',
	},
	{
		id: 1,
		title: 'Masking so much you have to relearn who you are',
		text: 'Losing touch with your authentic self, needs, and desires underneath years of performance.',
	},
];

export const STORAGE_KEY = 'autism_masking_checklist_state';

export const FAKE_LEADERBOARD = [
	{ rank: 1, initials: 'ASS', score: 30, locked: true },
	{ rank: 2, initials: 'NT', score: 28, locked: false },
	{ rank: 3, initials: 'MSK', score: 24, locked: false },
	{ rank: 4, initials: '???', score: 19, locked: false },
	{ rank: 5, initials: '1P', score: 0, locked: false, isPlayer: true },
] as const;

export type DangerStage = 'idle' | 'stage1' | 'caution' | 'burnout' | 'gameover';

export function getDangerStage(checkedCount: number): DangerStage {
	if (checkedCount === 0) return 'idle';
	if (checkedCount <= 7) return 'stage1';
	if (checkedCount <= 15) return 'caution';
	if (checkedCount <= 23) return 'burnout';
	return 'gameover';
}

export function getStageLabel(stage: DangerStage): string {
	switch (stage) {
		case 'idle':
			return 'INSERT COIN';
		case 'stage1':
			return 'STAGE 1';
		case 'caution':
			return 'CAUTION';
		case 'burnout':
			return 'BURNOUT ALERT';
		case 'gameover':
			return 'GAME OVER';
	}
}

export interface StageInsight {
	title: string;
	description: string;
}

export function getStageInsight(checkedCount: number): StageInsight {
	if (checkedCount === 0) {
		return {
			title: 'NO SIGNS CHECKED',
			description:
				'Select any of the signs above that resonate with your daily experiences to generate your total score and masking analysis.',
		};
	}
	if (checkedCount <= 7) {
		return {
			title: 'LOW MASKING SCORE (1 - 7)',
			description:
				'You report relatively few masking behaviors. You may feel comfortable expressing your needs naturally or experience minimal social masking energy drain.',
		};
	}
	if (checkedCount <= 15) {
		return {
			title: 'MODERATE MASKING SCORE (8 - 15)',
			description:
				'You regularly use masking strategies to navigate social scenarios. While manageable in small bursts, consistently hiding your traits can cause periodic mental fatigue.',
		};
	}
	if (checkedCount <= 23) {
		return {
			title: 'HIGH MASKING SCORE (16 - 23) - BURNOUT ALERT',
			description:
				'Warning: You engage in heavy daily masking. Maintaining this level of social performance often leads to severe energy drain, anxiety, physical fatigue, and suppressed meltdowns or shutdowns.',
		};
	}
	return {
		title: 'CRITICAL / VERY HIGH MASKING SCORE (24 - 30) - HIGH RISK OF CHRONIC BURNOUT',
		description:
			'Severe Warning: You are operating in constant survival mode. High levels of masking require immense neurological effort and frequently lead to autistic burnout, loss of identity, sensory overload, and chronic fatigue. Prioritizing rest and safe unmasking spaces is strongly recommended.',
	};
}
