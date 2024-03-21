export type PersonEntry = {
	id: string;
	name: string;
	picture: string;
	questions: string[];
};

export type SettingsEntry = {
	onePage: boolean;
	question: { question: string }[];
};
