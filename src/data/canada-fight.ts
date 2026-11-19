export type FightMode = 'sorry' | 'youll-be-sorry';
export type Lang = 'en' | 'fr';

export interface ModeCopy {
	headline: string;
	subhead: string;
	signTop: string;
	signBottom: string;
	barrierSign: string;
	paragraphs: string[];
	cta: string;
}

export interface PageCopy {
	pageTitle: string;
	pageDescription: string;
	kicker: string;
	modeSorry: string;
	modeThreat: string;
	langEn: string;
	langFr: string;
	footer: string;
	modes: Record<FightMode, ModeCopy>;
}

export const COPY: Record<Lang, PageCopy> = {
	en: {
		pageTitle: 'Strait of Our Moose | Marc Sherwood',
		pageDescription:
			'Picking a fight with Canada, two ways: we are sorry, or you will be sorry.',
		kicker: 'International incident, eh?',
		modeSorry: 'We Are Sorry',
		modeThreat: "You'll Be Sorry",
		langEn: 'English',
		langFr: 'Français (QC)',
		footer: 'Satire. The moose has not been consulted. Not affiliated with any government.',
		modes: {
			sorry: {
				headline: 'We Are Sorry',
				subhead:
					'Canada would like to apologize for the inconvenience of being your neighbour, your trading partner, and occasionally right.',
				signTop: 'Strait of',
				signBottom: 'Our Moose is sorry',
				barrierSign: 'SORRY — BEAR WITH US',
				paragraphs: [
					'We are sorry for the maple syrup. We are sorry for the healthcare. We are sorry you noticed.',
					'We did not mean to export politeness at this volume. We will try to tone it down.',
					'If tariffs are a love language, we misunderstood. Our bad. Truly.',
					'The moose has been asked to stand down. He is also sorry. He did not mean to look that judgmental.',
				],
				cta: 'Accept our apology (we will apologize again tomorrow)',
			},
			'youll-be-sorry': {
				headline: "You'll Be Sorry",
				subhead:
					'You picked a fight with a country that apologizes professionally and blocks straits recreationally.',
				signTop: 'Strait of',
				signBottom: 'OurMoose is closed',
				barrierSign: 'NO ENTRY — UNFAIR TARIFFS',
				paragraphs: [
					'You want a trade war? We invented waiting politely while winning.',
					'Threaten the 51st state and meet the only army with moose cavalry and zero chill.',
					'We have tariffs too. Ours are passive-aggressive and backed by Tim Hortons.',
					'The moose is not a negotiator. The moose is a consequence.',
				],
				cta: 'Lower the barrier (or dont — the moose likes it up)',
			},
		},
	},
	fr: {
		pageTitle: 'Détroit de Notre Orignal | Marc Sherwood',
		pageDescription:
			'Se chicaner avec le Canada, deux façons : on est désolés, ou vous allez le regretter.',
		kicker: 'Incident international, hein?',
		modeSorry: 'On Est Désolés',
		modeThreat: 'Vous Allez Le Regretter',
		langEn: 'English',
		langFr: 'Français (QC)',
		footer:
			'Satire. L’orignal n’a pas été consulté. Aucun lien avec un gouvernement.',
		modes: {
			sorry: {
				headline: 'On Est Désolés',
				subhead:
					'Le Canada aimerait s’excuser pour le désagrément d’être votre voisin, votre partenaire commercial, et d’avoir parfois raison.',
				signTop: 'Détroit de',
				signBottom: 'Notre Orignal est désolé',
				barrierSign: 'DÉSOLÉ — MERCI DE PATIENTER',
				paragraphs: [
					'On est désolés pour le sirop d’érable. On est désolés pour la santé publique. On est désolés que vous ayez remarqué.',
					'On voulait pas exporter la politesse à ce volume-là. On va essayer de baisser le ton.',
					'Si les tarifs, c’est une langue d’amour, on a mal compris. Notre faute. Vraiment.',
					'On a demandé à l’orignal de se calmer. Lui aussi est désolé. Il voulait pas avoir l’air jugemental.',
				],
				cta: 'Acceptez nos excuses (on va s’excuser encore demain)',
			},
			'youll-be-sorry': {
				headline: 'Vous Allez Le Regretter',
				subhead:
					'T’as choisi de chicaner un pays qui s’excuse professionnellement et qui bloque les détroits pour le plaisir.',
				signTop: 'Détroit de',
				signBottom: 'Notre Orignal est fermé',
				barrierSign: 'ENTRÉE INTERDITE — TARIFS INJUSTES',
				paragraphs: [
					'Tu veux une guerre commerciale? On a inventé l’art d’attendre poliment en gagnant.',
					'Menace le 51e état et tu vas faire face à la seule armée avec cavalerie d’orignaux et zero chill.',
					'On a des tarifs nous aussi. Les nôtres sont passive-agressifs et appuyés par Tim Hortons.',
					'L’orignal n’est pas un négociateur. L’orignal, c’est une conséquence.',
				],
				cta: 'Baisse la barrière (ou pas — l’orignal l’aime comme ça)',
			},
		},
	},
};

export function getCopy(lang: Lang, mode: FightMode): ModeCopy {
	return COPY[lang].modes[mode];
}
