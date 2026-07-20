import type { Locale } from "@/lib/locale";
import { isFullyBooked, isGroup2Phase } from "@/lib/booking-availability";

export const CONTACT_EMAIL = "contact@resulam.com";
export const AFRICAN_LANGUAGE_LIBRARY_URL = "https://africanlanguagelibrary.tchamna.com/";

export const content = {
  en: {
    navLanguage: "English",
    navResources: "Resources",
    designFlyer: "Classic",
    designMidnight: "Midnight",
    designHeritage: "Heritage",
    eyebrow: "France visit: August 6-11, 2026",
    title: "Resulam France 2026",
    heroDate: "August 9-10, 2026",
    heroTitle: "Resulam lands in France.",
    kicker: "Free conference",
    lead:
      "African languages conference with small Nufi workshops. Reconnect with your mother tongue and learn practical ways to transmit African languages at home.",
    cta: "Book a free place",
    heroContactBefore:
      "Would you like to organize a meeting in your city to learn or pass on your mother tongue? ",
    heroContactLink: "Contact us",
    heroContactAfter: " now.",
    limit: "Free entry. Places are limited, booking is required.",
    dateLabel: "Conference",
    dateValue: "August 9-10, 2026",
    visitLabel: "Resulam in France",
    visitValue: "August 6-11, 2026",
    costLabel: "Cost",
    costValue: "Free entry",
    locationLabel: "Location",
    locationValue: "Paris",
    venuesTitle: "Venues",
    venuesIntro: "Two Paris gatherings, with separate places and times.",
    venueDetailLabels: {
      address: "Address",
      intercom: "Left intercom",
      metro: "Metro",
      bus: "Bus",
      getThere: "How to get there",
      openMaps: "Open in Google Maps",
      showDirections: "Show directions",
      hideDirections: "Hide directions",
    },
    venues: [
      {
        date: "August 9",
        time: "14h-18h",
        name: "NDABC",
        description: "African languages conference with small Nufi workshops.",
        address: "80 rue de Meaux, 75019 Paris",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=80+Rue+de+Meaux%2C+75019+Paris",
        accessRoutes: [
          {
            mode: "metro",
            line: "5",
            title: "Metro line 5 · Laumière",
            steps: [
              { text: "Take line 5 to Laumière" },
              { text: "Exit via sortie 3", hint: "Sortez par 3" },
              { text: "5 min walk", hint: "200 m" },
            ],
          },
          {
            mode: "bus",
            line: "48",
            title: "Bus 48 · Rue de Meaux",
            steps: [
              { text: "Take bus 48 to Rue de Meaux" },
              { text: "5 min walk", hint: "300 m" },
            ],
          },
        ],
        details: [],
      },
      {
        date: "August 10",
        time: "9h-12h",
        name: "TAMERY SEMATAWY, Librairie Kamite Panafricaine",
        address: "15-17-19 rue du Chalet, 75010 Paris, France",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=15-17-19+rue+du+Chalet%2C+75010+Paris",
        accessRoutes: [
          {
            mode: "metro",
            line: "2",
            title: "Metro line 2 · Belleville",
            steps: [
              { text: "Take line 2 to Belleville" },
              { text: "5 min walk", hint: "~400 m" },
            ],
          },
          {
            mode: "metro",
            line: "11",
            title: "Metro line 11 · Belleville",
            steps: [
              { text: "Take line 11 to Belleville" },
              { text: "5 min walk", hint: "~400 m" },
            ],
          },
          {
            mode: "bus",
            line: "20",
            title: "Bus 20 or 71 · Belleville",
            steps: [
              { text: "Take bus 20 or 71 to Belleville" },
              { text: "5 min walk", hint: "~400 m" },
            ],
          },
          {
            mode: "bus",
            line: "46",
            title: "Bus 46 · Hôpital Saint-Louis",
            steps: [
              { text: "Take bus 46 to Hôpital Saint-Louis" },
              { text: "4 min walk", hint: "~300 m" },
            ],
          },
        ],
        details: [
          { label: "intercom", text: "TAMERY - scroll through the names and ring; courtyard access on the right." },
        ],
      },
    ],
    mediaTitle: "Videos, applications, USB resources and literacy lessons",
    testimony: "Nufi testimony",
    cartoons: "Learning videos",
    books: "Books and grammar resources",
    sectionTitle: "What you will discover",
    sectionText:
      "An African languages conference with small Nufi workshops — a practical day for families, adults, and anyone who wants to restart language transmission.",
    benefits: [
      {
        id: "teaching",
        title: "Teaching",
        text: "How to teach African languages to your children at home.",
      },
      {
        id: "adults",
        title: "Adults",
        text: "How adults can start learning even if they missed the chance in childhood.",
      },
      {
        id: "books",
        title: "Books",
        text: "Books for learning African languages.",
      },
      {
        id: "apps",
        title: "Applications",
        text: "Applications and digital tools.",
      },
      {
        id: "usb",
        title: "USB drives",
        text: "USB drives containing learning videos.",
      },
      {
        id: "surprises",
        title: "Surprises",
        text: "More surprises for participants.",
      },
    ],
    form: {
      title: "Reserve your place",
      intro: "We only need a few details to hold your seat.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      languages: "African languages you are interested in",
      languagesPlaceholder: "Example: swahili, wolof, nufi, kikongo",
      optional: "optional",
      button: "Confirm seat",
      buttonWaitlist: "Join waiting list",
      sending: "Sending...",
      success: "Your place is confirmed. {count} places left.",
      successWaitlist:
        "You are on the waiting list. We will contact you if a place opens up.",
      error: "We could not submit your booking. Please try again.",
      seatsLabel: "Conference seats",
      seatsAvailable: "{count} places available",
      seatsLeft: "{count} places left",
      seatsLeftOne: "1 place left",
      group2Badge: "Group 2: {count} places left",
      group2BadgeOne: "Group 2: 1 place left",
      waitlistBadge: "Waitinglist: +{count}",
      group2Intro:
        "Great news — due to overwhelming interest, we are opening a second group with 50 additional seats. Group 1 is full; {count} places remain in Group 2. Reserve yours now.",
      group2IntroOne:
        "Great news — due to overwhelming interest, we are opening a second group with 50 additional seats. Group 1 is full; only 1 place remains in Group 2.",
      soldOut: "Fully booked — waiting list open",
      soldOutIntro:
        "All 100 places have been reserved. You can still sign up for the waiting list if someone drops out or changes their mind.",
      duplicate: "This email already has a reservation.",
      duplicateWaitlist: "This email is already on the waiting list.",
      duplicateResent:
        "This email already has a reservation. We sent your confirmation email again.",
      duplicateWaitlistResent:
        "This email is already on the waiting list. We sent your confirmation email again.",
      duplicatePopupTitle: "You already have a reservation",
      duplicatePopupOk: "OK, got it",
      checkSpam:
        "If you don't see the confirmation email, check your spam or junk folder.",
      emailWarning:
        "Your seat is saved, but we could not send a confirmation email. Check your spam folder or contact contact@resulam.com.",
      fullError:
        "Sorry, the last places were just booked. You can join the waiting list below.",
      validationError: "Please check your name, email, and languages (at least 2 characters).",
    },
    footer: "Resulam France 2026",
    bookstoreTitle: "African language books & resources",
    bookstoreHint: "Click an image to visit our online bookstore.",
    bookstoreLinkLabel: "Visit the African Language Library bookstore",
    bookstoreAltNufi: "Nufi phrasebook, grammar, and Bamileke tales on a bookshelf",
    bookstoreAltEwondo: "Fè'éfě'è and Ewondo visual dictionaries and conversation guides on a bookshelf",
    bookstorePopupTitle: "Explore African language resources",
    bookstorePopupMessage: "Click here to get resources from African Languages.",
    bookstorePopupClose: "Close",
    music: {
      play: "Play music",
      pause: "Pause music",
    },
    greetings: {
      eyebrow: "Mother tongues",
      title: "How we greet each other",
      howAreYou: "How are you?",
      welcome: "Welcome",
      listenHint: "Tap a phrase to hear it spoken.",
      playLabel: "Play phrase",
      playingLabel: "Pause phrase",
      openPhrasebook: "Open in phrasebook",
    },
    heritage: {
      headline: "Reconnect with your mother tongue",
      eventLine: "August 9-10, 2026 — Resulam in France",
      libraryTitle: "Explore our complete heritage resource library",
      librarySubtitle: "Videos, books, apps & USBs",
      libraryNote: "Access to over 1000+ curated language lessons.",
      stamp: "Free conference",
      urgency: "Only {count} places left",
      urgencyOne: "Only 1 place left",
      urgencyGroup2: "Group 2 open — only {count} places left",
      urgencyGroup2One: "Group 2 open — only 1 place left",
      urgencySoldOut: "Fully booked — join the waiting list",
    },
    midnight: {
      badge: "France 2026",
      navVisit: "The Visit",
      navMoments: "Moments",
      navConference: "Conference",
      navBook: "Book now",
      tagline: "A celebration of our mother tongues",
      title: "Resulam lands in France.",
      dateRange: "6–11",
      dateMonth: "August 2026",
      heroLead:
        "A week of gatherings across France — with a free African languages conference and Nufi workshops on August 9 and 10. Limited places.",
      heroLeadHighlight: "free African languages conference and Nufi workshops on August 9 and 10",
      ctaPrimary: "Reserve your place",
      ctaSecondary: "See the programme",
      momentsLabel: "In pictures & film",
      momentsTitle: "Moments from Resulam",
      statDaysTitle: "6 days",
      statDaysText: "Gatherings across France, Aug 6–11.",
      statFreeTitle: "Aug 9-10 • Free",
      statFreeText: "African languages conference, Nufi workshops.",
      statLimitedTitle: "Limited",
      statLimitedText: "Seats fill fast — reserve early.",
    },
  },
  fr: {
    navLanguage: "Français",
    navResources: "Ressources",
    designFlyer: "Classique",
    designMidnight: "Midnight",
    designHeritage: "Patrimoine",
    eyebrow: "CONFÉRENCE SUR LES LANGUES AFRICAINES",
    title: "RESULAM arrive en France",
    heroDate: "9-10 Août 2026",
    heroTitle: "RESULAM arrive en France",
    kicker: "CONFÉRENCE SUR LES LANGUES AFRICAINES",
    lead:
      "Conférence des langues africaines avec petits ateliers sur le Nufi. Venez redécouvrir votre langue maternelle et découvrir des méthodes concrètes pour transmettre les langues africaines aux enfants à la maison.",
    cta: "Réserver gratuitement",
    heroContactBefore:
      "Vous souhaitez organiser une rencontre dans votre ville pour apprendre ou transmettre votre langue maternelle ? ",
    heroContactLink: "Contactez-nous",
    heroContactAfter: " dès maintenant.",
    limit: "Entrée gratuite — places limitées",
    dateLabel: "Conférence",
    dateValue: "9-10 août 2026",
    visitLabel: "Resulam en France",
    visitValue: "6-11 août 2026",
    costLabel: "Tarif",
    costValue: "Entrée gratuite",
    locationLabel: "Lieu",
    locationValue: "Paris",
    venuesTitle: "Lieux",
    venuesIntro: "Deux rencontres à Paris, avec des lieux et horaires distincts.",
    venueDetailLabels: {
      address: "Adresse",
      intercom: "Interphone de gauche",
      metro: "Métro",
      bus: "Bus",
      getThere: "Comment y aller",
      openMaps: "Ouvrir dans Google Maps",
      showDirections: "Voir l'accès",
      hideDirections: "Masquer l'accès",
    },
    venues: [
      {
        date: "9 août",
        time: "14h à 18h",
        name: "NDABC",
        description: "Conférence des langues africaines avec petits ateliers sur le Nufi.",
        address: "80 rue de Meaux, 75019 Paris",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=80+Rue+de+Meaux%2C+75019+Paris",
        accessRoutes: [
          {
            mode: "metro",
            line: "5",
            title: "Métro ligne 5 · Laumière",
            steps: [
              { text: "Prenez la ligne 5 jusqu’à Laumière" },
              { text: "Sortez par la sortie 3", hint: "Sortez par 3" },
              { text: "5 min à pied", hint: "200 m" },
            ],
          },
          {
            mode: "bus",
            line: "48",
            title: "Bus 48 · Rue de Meaux",
            steps: [
              { text: "Prenez le bus 48 jusqu’à Rue de Meaux" },
              { text: "5 min à pied", hint: "300 m" },
            ],
          },
        ],
        details: [],
      },
      {
        date: "10 août",
        time: "9h-12h",
        name: "TAMERY SEMATAWY, Librairie Kamite Panafricaine",
        address: "15-17-19 rue du Chalet, 75010 Paris, France",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=15-17-19+rue+du+Chalet%2C+75010+Paris",
        accessRoutes: [
          {
            mode: "metro",
            line: "2",
            title: "Métro ligne 2 · Belleville",
            steps: [
              { text: "Prenez la ligne 2 jusqu’à Belleville" },
              { text: "5 min à pied", hint: "~400 m" },
            ],
          },
          {
            mode: "metro",
            line: "11",
            title: "Métro ligne 11 · Belleville",
            steps: [
              { text: "Prenez la ligne 11 jusqu’à Belleville" },
              { text: "5 min à pied", hint: "~400 m" },
            ],
          },
          {
            mode: "bus",
            line: "20",
            title: "Bus 20 ou 71 · Belleville",
            steps: [
              { text: "Prenez le bus 20 ou 71 jusqu’à Belleville" },
              { text: "5 min à pied", hint: "~400 m" },
            ],
          },
          {
            mode: "bus",
            line: "46",
            title: "Bus 46 · Hôpital Saint-Louis",
            steps: [
              { text: "Prenez le bus 46 jusqu’à Hôpital Saint-Louis" },
              { text: "4 min à pied", hint: "~300 m" },
            ],
          },
        ],
        details: [
          { label: "intercom", text: "TAMERY - faire défiler les noms et sonner ; accès cour à droite." },
        ],
      },
    ],
    mediaTitle: "Vidéos, applications, clés USB et leçons d'alphabétisation",
    testimony: "Témoignage en nufi",
    cartoons: "Vidéos d'apprentissage",
    books: "Livres et grammaire",
    sectionTitle: "Ce que vous allez découvrir",
    sectionText:
      "Conférence des langues africaines avec petits ateliers sur le Nufi — une journée pratique pour les familles, les adultes, et toute personne qui veut relancer la transmission des langues.",
    benefits: [
      {
        id: "teaching",
        title: "Enseignement",
        text: "Comment enseigner les langues africaines à vos enfants à la maison.",
      },
      {
        id: "adults",
        title: "Adultes",
        text: "Comment les adultes peuvent commencer même sans avoir appris dans l'enfance.",
      },
      {
        id: "books",
        title: "Livres",
        text: "Des livres pour apprendre les langues africaines.",
      },
      {
        id: "apps",
        title: "Applications",
        text: "Des applications et outils numériques.",
      },
      {
        id: "usb",
        title: "Clés USB",
        text: "Des clés USB contenant des vidéos d'apprentissage.",
      },
      {
        id: "surprises",
        title: "Surprises",
        text: "Et beaucoup d'autres surprises pour les participants.",
      },
    ],
    form: {
      title: "Réserver votre place",
      intro: "Quelques informations suffisent pour garder votre place.",
      name: "Nom",
      email: "Email",
      phone: "Téléphone",
      languages: "Langues africaines qui vous intéressent",
      languagesPlaceholder: "Exemple : swahili, wolof, nufi, kikongo",
      optional: "facultatif",
      button: "Confirmer ma place",
      buttonWaitlist: "Rejoindre la liste d'attente",
      sending: "Envoi...",
      success: "Votre place est confirmée. Il reste {count} places.",
      successWaitlist:
        "Vous êtes inscrit(e) sur la liste d'attente. Nous vous contacterons si une place se libère.",
      error: "Impossible d'envoyer votre réservation. Veuillez réessayer.",
      seatsLabel: "Places conférence",
      seatsAvailable: "{count} places disponibles",
      seatsLeft: "Il reste {count} places",
      seatsLeftOne: "Il reste 1 place",
      group2Badge: "Groupe 2 : {count} places restantes",
      group2BadgeOne: "Groupe 2 : 1 place restante",
      waitlistBadge: "Liste d'attente : +{count}",
      group2Intro:
        "Bonne nouvelle ! Face à l'enthousiasme suscité, nous ouvrons un Groupe 2 avec 50 places supplémentaires. Le Groupe 1 est complet — il reste {count} places. Réservez la vôtre sans tarder.",
      group2IntroOne:
        "Bonne nouvelle ! Face à l'enthousiasme suscité, nous ouvrons un Groupe 2 avec 50 places supplémentaires. Le Groupe 1 est complet — il ne reste qu'une place.",
      soldOut: "Complet — liste d'attente ouverte",
      soldOutIntro:
        "Les 100 places sont réservées. Vous pouvez encore vous inscrire sur la liste d'attente si une personne se désiste ou change d'avis.",
      duplicate: "Cet email a déjà une réservation.",
      duplicateWaitlist: "Cet email est déjà inscrit sur la liste d'attente.",
      duplicateResent:
        "Cet email a déjà une réservation. Nous avons renvoyé l'email de confirmation.",
      duplicateWaitlistResent:
        "Cet email est déjà inscrit sur la liste d'attente. Nous avons renvoyé l'email de confirmation.",
      duplicatePopupTitle: "Vous avez déjà une réservation",
      duplicatePopupOk: "D'accord",
      checkSpam:
        "Si vous ne voyez pas l'email de confirmation, vérifiez vos courriers indésirables (spam).",
      emailWarning:
        "Votre place est enregistrée, mais nous n'avons pas pu envoyer l'email de confirmation. Vérifiez vos spams ou écrivez à contact@resulam.com.",
      fullError:
        "Désolé, les dernières places viennent d'être réservées. Vous pouvez vous inscrire sur la liste d'attente ci-dessous.",
      validationError: "Vérifiez votre nom, email et langues (au moins 2 caractères).",
    },
    footer: "Resulam France 2026",
    bookstoreTitle: "Livres et ressources en langues africaines",
    bookstoreHint: "Cliquez sur une image pour visiter notre librairie en ligne.",
    bookstoreLinkLabel: "Visiter la librairie African Language Library",
    bookstoreAltNufi: "Phrasebook, grammaire et contes bamilékés en nufi sur une étagère",
    bookstoreAltEwondo: "Syllabaires visuels et guides de conversation fè'éfě'è et ewondo sur une étagère",
    bookstorePopupTitle: "Découvrez les ressources en langues africaines",
    bookstorePopupMessage: "Cliquez ici pour accéder aux ressources en langues africaines.",
    bookstorePopupClose: "Fermer",
    music: {
      play: "Lancer la musique",
      pause: "Couper la musique",
    },
    greetings: {
      eyebrow: "Langues maternelles",
      title: "Comment on se salue",
      howAreYou: "Comment ça va ?",
      welcome: "Bienvenue",
      listenHint: "Appuyez sur une phrase pour l'écouter.",
      playLabel: "Écouter la phrase",
      playingLabel: "Mettre en pause",
      openPhrasebook: "Ouvrir dans le phrasebook",
    },
    heritage: {
      headline: "Retrouvez votre langue maternelle",
      eventLine: "9-10 août 2026 — Resulam en France",
      libraryTitle: "Explorez notre bibliothèque patrimoniale complète",
      librarySubtitle: "Vidéos, livres, apps et clés USB",
      libraryNote: "Accès à plus de 1000 leçons de langues sélectionnées.",
      stamp: "Conférence gratuite",
      urgency: "Plus que {count} places",
      urgencyOne: "Plus qu'une place",
      urgencyGroup2: "Groupe 2 ouvert — plus que {count} places",
      urgencyGroup2One: "Groupe 2 ouvert — plus qu'une place",
      urgencySoldOut:
        "Complet, mais vous pouvez vous inscrire sur la liste d'attente si une place se libère",
    },
    midnight: {
      badge: "France 2026",
      navVisit: "Le séjour",
      navMoments: "Moments",
      navConference: "Conférence",
      navBook: "Réserver",
      tagline: "CONFÉRENCE SUR LES LANGUES AFRICAINES",
      title: "RESULAM arrive en France",
      dateRange: "6–11",
      dateMonth: "Août 2026",
      heroLead:
        "Venez redécouvrir votre langue maternelle et découvrir des méthodes concrètes pour transmettre les langues africaines aux enfants à la maison. Entrée gratuite — places limitées.",
      heroLeadHighlight: "méthodes concrètes pour transmettre les langues africaines",
      ctaPrimary: "Réserver votre place",
      ctaSecondary: "Voir le programme",
      momentsLabel: "En images et vidéos",
      momentsTitle: "Moments de Resulam",
      statDaysTitle: "6 jours",
      statDaysText: "Rencontres en France, 6–11 août.",
      statFreeTitle: "9-10 août • Gratuit",
      statFreeText: "Conférence des langues africaines, ateliers Nufi.",
      statLimitedTitle: "Limité",
      statLimitedText: "Les places partent vite — réservez tôt.",
    },
  },
} as const;

export const statsContent = {
  en: {
    title: "Language interest stats",
    intro: "Number of reservations that mention each African language.",
    totalBookings: "Total reservations",
    language: "Language",
    reservations: "Reservations",
    share: "Share",
    empty: "No bookings recorded yet.",
    denied: "Access denied. Open this page with ?key=YOUR_KEY in the URL.",
    back: "Back to site",
    normalizedStatsLink: "Normalized stats",
  },
  fr: {
    title: "Statistiques des langues",
    intro: "Nombre de réservations mentionnant chaque langue africaine.",
    totalBookings: "Réservations totales",
    language: "Langue",
    reservations: "Réservations",
    share: "Part",
    empty: "Aucune réservation enregistrée.",
    denied: "Accès refusé. Ouvrez cette page avec ?key=VOTRE_CLE dans l'URL.",
    back: "Retour au site",
    normalizedStatsLink: "Stats normalisées",
  },
} as const;

export const normalizedStatsContent = {
  en: {
    title: "Normalized language stats",
    intro:
      "Languages merged by alias (e.g. Fefe → Nufi) and split when several names appear in one field.",
    totalBookings: "Total reservations",
    language: "Language",
    reservations: "Reservations",
    share: "Share",
    empty: "No bookings recorded yet.",
    denied: "Access denied. Open this page with ?key=YOUR_KEY in the URL.",
    back: "Back to site",
    rawStatsLink: "Raw language stats",
    splitNote:
      "Normalized reservation counts can exceed total bookings when one reservation lists several languages (e.g. “Ghomala Medumba”).",
  },
  fr: {
    title: "Statistiques langues normalisées",
    intro:
      "Langues fusionnées par alias (ex. Fefe → Nufi) et séparées lorsque plusieurs noms figurent dans un même champ.",
    totalBookings: "Réservations totales",
    language: "Langue",
    reservations: "Réservations",
    share: "Part",
    empty: "Aucune réservation enregistrée.",
    denied: "Accès refusé. Ouvrez cette page avec ?key=VOTRE_CLE dans l'URL.",
    back: "Retour au site",
    rawStatsLink: "Stats langues brutes",
    splitNote:
      "Le total des réservations normalisées peut dépasser le nombre de réservations lorsqu'une inscription mentionne plusieurs langues (ex. « Ghomala Medumba »).",
  },
} as const;

export const adminContent = {
  en: {
    title: "Booking admin",
    intro: "Registered attendees and language breakdown from reservations.",
    totalBookings: "Total bookings",
    languagesChart: "Languages by reservation",
    subscribers: "Registered attendees",
    language: "Language",
    reservations: "Reservations",
    share: "Share",
    name: "Name",
    email: "Email",
    phone: "Phone",
    languages: "Languages",
    locale: "Locale",
    date: "Registered",
    empty: "No bookings recorded yet.",
    denied: "Access denied. Open this page with ?key=YOUR_KEY in the URL.",
    back: "Back to site",
    statsLink: "Language stats only",
    normalizedStatsLink: "Normalized stats",
    loginTitle: "Admin sign in",
    loginIntro: "Enter your admin email, then continue with Google to receive a secure session.",
    loginEmailLabel: "Admin email",
    loginEmailPlaceholder: "you@resulam.com",
    signInWithGoogle: "Continue with Google",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    loginErrorUnauthorized: "This Google account is not authorized for admin access.",
    loginErrorOAuth: "Google sign-in failed. Please try again.",
    loginErrorState: "Sign-in expired or was invalid. Please try again.",
    loginErrorConfig: "Google sign-in is not configured on this server.",
    loginErrorEmail: "Enter your admin email before continuing with Google.",
  },
  fr: {
    title: "Administration des réservations",
    intro: "Liste des inscrits et répartition des langues mentionnées.",
    totalBookings: "Réservations totales",
    languagesChart: "Langues par réservation",
    subscribers: "Personnes inscrites",
    language: "Langue",
    reservations: "Réservations",
    share: "Part",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    languages: "Langues",
    locale: "Langue du site",
    date: "Inscription",
    empty: "Aucune réservation enregistrée.",
    denied: "Accès refusé. Ouvrez cette page avec ?key=VOTRE_CLE dans l'URL.",
    back: "Retour au site",
    statsLink: "Statistiques langues seules",
    normalizedStatsLink: "Stats normalisées",
    loginTitle: "Connexion admin",
    loginIntro: "Saisissez votre e-mail admin, puis continuez avec Google pour obtenir une session sécurisée.",
    loginEmailLabel: "E-mail admin",
    loginEmailPlaceholder: "vous@resulam.com",
    signInWithGoogle: "Continuer avec Google",
    signedInAs: "Connecté en tant que",
    signOut: "Se déconnecter",
    loginErrorUnauthorized: "Ce compte Google n'est pas autorisé pour l'administration.",
    loginErrorOAuth: "La connexion Google a échoué. Veuillez réessayer.",
    loginErrorState: "La connexion a expiré ou est invalide. Veuillez réessayer.",
    loginErrorConfig: "La connexion Google n'est pas configurée sur ce serveur.",
    loginErrorEmail: "Saisissez votre e-mail admin avant de continuer avec Google.",
  },
} as const;

export type PageCopy = (typeof content)[Locale];

export type MidnightCopy = PageCopy["midnight"];
export type HeritageCopy = PageCopy["heritage"];

export function getDesignLabel(t: PageCopy, variant: "flyer" | "midnight" | "heritage"): string {
  if (variant === "flyer") return t.designFlyer;
  if (variant === "midnight") return t.designMidnight;
  return t.designHeritage;
}

export function formatHeritageUrgency(
  copy: HeritageCopy,
  remaining: number,
  full: boolean,
  booked = 0,
  group1Capacity = 50,
): string {
  if (isFullyBooked(remaining, full)) return copy.urgencySoldOut;
  if (isGroup2Phase(booked, remaining, group1Capacity)) {
    if (remaining === 1) return copy.urgencyGroup2One;
    return copy.urgencyGroup2.replace("{count}", String(remaining));
  }
  if (remaining === 1) return copy.urgencyOne;
  return copy.urgency.replace("{count}", String(remaining));
}

export type MomentSlide = {
  id: string;
  label: string;
  meta: string;
  kind: "video" | "youtube" | "book";
  src: string;
  poster?: string;
  alt: string;
};

export function getMomentSlides(t: PageCopy): MomentSlide[] {
  return [
    {
      id: "testimony",
      label: t.testimony,
      meta: "Aug 7",
      kind: "video",
      src: "/landing/lecture-langues-africaines-pangop-7ans.mp4",
      alt: "Pangop lit parfaitement en langues africaines",
    },
    {
      id: "literacy-basaa",
      label: "(Basaa-Cameroun) - Alphabetisation en langues africaines",
      meta: "Aug 9",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=UotEdTkPrBk",
      alt: "(Basaa-Cameroun) - Alphabetisation en langues africaines",
    },
    {
      id: "literacy-ewondo",
      label: "(Ewondo-BetiFang) - Alphabetisation en langues africaines",
      meta: "Aug 9",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=VD7cGtU5rfU",
      alt: "(Ewondo-BetiFang) - Alphabetisation en langues africaines",
    },
    {
      id: "literacy-nufi",
      label: "(Bamileke-Nufi) - Alphabetisation en langues africaines",
      meta: "Aug 9",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=XRrEKXUwny4",
      alt: "(Bamileke-Nufi) - Alphabetisation en langues africaines",
    },
    {
      id: "literacy-ghomala",
      label: "(Bamileke-Ghomala') - Alphabetisation en langues africaines",
      meta: "Aug 9",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=FtGEI6UHM9o",
      alt: "(Bamileke-Ghomala') - Alphabetisation en langues africaines",
    },
    {
      id: "literacy-duala",
      label: "(Duala-Douala) - Alphabetisation en langues africaines",
      meta: "Aug 9",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=ddwGaTng6xo",
      alt: "(Duala-Douala) - Alphabetisation en langues africaines",
    },
    {
      id: "cartoon-nufi",
      label: t.cartoons,
      meta: "Aug 7",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=rr2nlVF7kgE&t=55s",
      poster: "/landing/nufi-cartoon-presentation.png",
      alt: "Resulam Nufi cartoon preview",
    },
    {
      id: "cartoon-african",
      label: t.cartoons,
      meta: "Aug 8",
      kind: "youtube",
      src: "https://www.youtube.com/watch?v=xusm6BsMVWg",
      alt: "Resulam African language cartoon preview",
    },
  ];
}
