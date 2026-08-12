export interface AssemblyCode {
	code: string;
	area: string;
	parts: string;
}

export const assemblyCodes: AssemblyCode[] = [
	{ code: 'ENG', area: 'Engine', parts: 'Crankcases, cylinder, head, internals, covers' },
	{ code: 'GBX', area: 'Gearbox & Clutch', parts: 'Gears, shafts, clutch basket, plates, shifter' },
	{ code: 'FF', area: 'Front Fork', parts: 'Tubes, springs, triple clamps, steering stem' },
	{ code: 'RW / FW', area: 'Rear & Front Wheels', parts: 'Rims, spokes, hubs, brake drums, axles' },
	{ code: 'HC', area: 'Handlebars & Controls', parts: 'Bars, levers, cables, twist grips' },
	{ code: 'CS-RB-FR', area: 'Center Stand, Brake, Footrests', parts: 'Kickstand, rear brake pedal, linkages' },
	{ code: 'LH', area: 'Lamp & Horn', parts: 'Headlight bucket, bulbs, switches, horn' },
	{ code: 'ELEC', area: 'Electrical System', parts: 'Stator, rotor, battery box, coil, wiring' },
	{ code: 'CARB', area: 'Carburetor', parts: "Dell'Orto UBF 24 BS, manifold, air filter" },
	{ code: 'EXH', area: 'Exhaust System', parts: 'Header pipe, muffler, clamps' },
];
