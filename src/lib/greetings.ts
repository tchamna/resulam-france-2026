export type GreetingEntry = {
  slug: string;
  language: string;
  translation: string;
  audio?: string;
};

const PHRASEBOOK_AUDIO = "https://african-polyglot.com/api/phrasebook/audio";

function phraseAudio(slug: string, phraseId: 5 | 176) {
  return `${PHRASEBOOK_AUDIO}/${slug}/${phraseId}`;
}

const greetingLanguages = [
  { slug: "basaa", hasAudio: true, language: "Basaa", howAreYou: "Mbóó í ŋ́kɛ̀ láá?", welcome: "Màlɔ̀ màlám." },
  { slug: "chichewa", hasAudio: true, language: "Chichewa", howAreYou: "Muli bwanji?", welcome: "Takulandirani!" },
  { slug: "duala-douala", hasAudio: true, language: "Duala / Douala", howAreYou: "É ma alá nɛ̂?", welcome: "Pɔ lá ɓwâm!" },
  { slug: "ewe-togo", hasAudio: false, language: "Ewe (Togo)", howAreYou: "Àléké wòlè yìyìm?", welcome: "Wóézõ!" },
  { slug: "ewondo", hasAudio: true, language: "Ewondo", howAreYou: "Onə yá?", welcome: "M̀bəmbə ǹsóán." },
  { slug: "fulfulde-benin", hasAudio: true, language: "Fulfulde (Benin)", howAreYou: "Noy gonirɗa?", welcome: "Foofo e garol…" },
  { slug: "fulfulde-nigeria", hasAudio: false, language: "Fulfulde (Nigeria)", howAreYou: "Noi gonɗa?", welcome: "Jaɓɓaama." },
  { slug: "ghomala", hasAudio: true, language: "Ghomala", howAreYou: "Â m gaə̂ kə̀?", welcome: "Sɔ' pəpúŋ." },
  { slug: "hausa", hasAudio: false, language: "Hausa", howAreYou: "Kan lafiya", welcome: "Maraba da zuwa!" },
  { slug: "igbo", hasAudio: true, language: "Igbo", howAreYou: "Kèdụ kà í mèrè?", welcome: "Ǹnọ̀ọ̀." },
  { slug: "kikongo", hasAudio: false, language: "Kikongo", howAreYou: "Ebwe mavimpi.", welcome: "Wiza mu yenge." },
  { slug: "kikongo-monokituba", hasAudio: false, language: "Kikongo Monokituba", howAreYou: "Ebwe nge.", welcome: "Kukwisa ya mbote." },
  { slug: "kinyarwanda", hasAudio: false, language: "Kinyarwanda", howAreYou: "Umeze gute?", welcome: "Ikaze!" },
  { slug: "lingala", hasAudio: true, language: "Lingala", howAreYou: "Ozali malámu?", welcome: "Boyéi bolámu." },
  { slug: "medumba", hasAudio: false, language: "Medumba", howAreYou: "Ndʉ̂kə?", welcome: "Sə̌' mə̀bwɔ!" },
  { slug: "nufi", hasAudio: true, language: "Nufi", howAreYou: "Yáá mɑ̀ lāhā?", welcome: "Sɑ̌' pə̀pē'!" },
  { slug: "shupamom", hasAudio: true, language: "Shupamom", howAreYou: "U sǎ' ná?", welcome: "Pookɛ́t pә́nzéé ŋkut!" },
  { slug: "swahili", hasAudio: true, language: "Swahili", howAreYou: "Una hali gani?", welcome: "Karibu!" },
  { slug: "tshiluba", hasAudio: false, language: "Tshiluba", howAreYou: "Bishi wewa.", welcome: "Ulua biakana." },
  { slug: "twi", hasAudio: true, language: "Twi", howAreYou: "Wo ho te sɛn?", welcome: "Akwaaba!" },
  { slug: "wolof", hasAudio: false, language: "Wolof", howAreYou: "Ci loo nekk.", welcome: "Dalal ak jàmm!" },
  { slug: "yemba", hasAudio: true, language: "Yemba", howAreYou: "Aá lεkɔ̄?", welcome: "Zέhέ léshʉ'…" },
  { slug: "yoruba", hasAudio: true, language: "Yoruba", howAreYou: "Báwo ni?", welcome: "Káàbọ̀!" },
  { slug: "zulu", hasAudio: true, language: "Zulu", howAreYou: "Unjani?", welcome: "Wamukelekile!" },
] as const;

export const howAreYouGreetings: GreetingEntry[] = greetingLanguages.map((entry) => ({
  slug: entry.slug,
  language: entry.language,
  translation: entry.howAreYou,
  audio: entry.hasAudio ? phraseAudio(entry.slug, 5) : undefined,
}));

export const welcomeGreetings: GreetingEntry[] = greetingLanguages.map((entry) => ({
  slug: entry.slug,
  language: entry.language,
  translation: entry.welcome,
  audio: entry.hasAudio ? phraseAudio(entry.slug, 176) : undefined,
}));

export type GreetingsCopy = {
  eyebrow: string;
  title: string;
  howAreYou: string;
  welcome: string;
  listenHint: string;
  playLabel: string;
  playingLabel: string;
  openPhrasebook: string;
};

export const phrasebookLinks = {
  howAreYou:
    "https://african-polyglot.com/phrases?q=how%20are%20you&lang=basaa,chichewa,duala-douala,ewe-togo,ewondo,fulfulde-benin,fulfulde-nigeria,ghomala,hausa,igbo,kikongo,kikongo-monokituba,kinyarwanda,lingala,medumba,nufi,shupamom,swahili,tshiluba,twi,wolof,yemba,yoruba,zulu",
  welcome:
    "https://african-polyglot.com/phrases?q=welcome&lang=basaa,chichewa,duala-douala,ewe-togo,ewondo,fulfulde-benin,fulfulde-nigeria,ghomala,hausa,igbo,kikongo,kikongo-monokituba,kinyarwanda,lingala,medumba,nufi,shupamom,swahili,tshiluba,twi,wolof,yemba,yoruba,zulu",
};
