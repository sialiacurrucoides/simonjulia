export default {
  metaDescription: "The personal website of web developer Júlia Simon.",
  nav: {
    blog: "Digital garden",
    about: "About me",
    projects: "Projects",
  },
  digitalGarden: {
    definition: "A digital garden is a non-linear collection of evolving notes, ideas, and resources. It is different from a blog in a way that is less organized and can change over time like a garden.",
    introduction: "I'm passionate about always learning something, and I have thought of making notes for my future self or for other developers who might find my summaries useful."
  },
  about: {
    degree: "I have a PhD degree in Cognitive Psychology and I was enthusiastic to do basic research, but time passed by and I felt the need to create something tangible.",
    programmingRoots: "Programming has always been close to me as I tried to build small games even during my BA studies. Later on, I used programming to construct experiments and analyze data.",
    programmingWhy: "Then I found web development, a field that is related to many of my interests: problem solving, visual art and human behavior.",
    experience: "In the last five years (2021-2026) I worked in fantastic teams (Warner Brothers, Warner Brothers and Discovery, Mindtechapps inner teams, IESF, Mazed, Spotify). I will always be grateful to the leaders I learned a lot from (without claim to completeness): Lei, Mikael Ek, Légár Eszter, Márton Volosin, Dávid Tóth and Milán Néninger.",
    choiceOfWeapon: "Choice of weapon:",
    hobbies: "Hobbies: gardening, playing with my dogs, cooking plant based, reading"
  },
  projects: {
    descriptionOld: "I was hesitant to show a project from very first works. However, I still find it cute that I wrote a game just to learn which plastic type is reusable.",
    plastic3matchDescription: "You can only combine and eliminate the recyclable plastic pieces, unless you develop a new technology.",
    kasszy: {
      eyebrow: "Featured project",
      tagline: "A PWA for everyday household finances: transactions, shopping list and pantry in one place.",
      cta: "Try Kasszy",
      newTab: "(opens in a new tab)",
      imageAlt: "Kasszy login screen with Face ID, Google and email sign-in options",
      carouselLabel: "Kasszy features",
      prev: "Previous feature",
      next: "Next feature",
      slideLabel: "{current} of {total}",
      features: {
        login: {
          title: "Sign in your way",
          description: "Log in with Google or with email and password. Two-factor authentication is optional, so you decide how strict it should be."
        },
        passkey: {
          title: "Passkeys",
          description: "Face ID or fingerprint instead of a password: quicker to use and resistant to phishing."
        },
        offline: {
          title: "Offline shopping list",
          description: "Once the shopping list has loaded, it stays available in the shop, even without signal."
        },
        realtime: {
          title: "Live knowledge base badge",
          description: "A badge updates in real time as soon as a new knowledge base article is published."
        },
        recurring: {
          title: "Recurring transactions",
          description: "Set up repeating bills and subscriptions. A scheduled job sends an in-app reminder the day before they are due."
        },
        backup: {
          title: "Daily backups",
          description: "Data is backed up automatically every day."
        },
        encryption: {
          title: "Encrypted amounts",
          description: "Transaction amounts are stored encrypted, so they can't be read as plain numbers in the database."
        },
        sharing: {
          title: "Shared pantry and shopping list",
          description: "Share the pantry and the shopping list with your household, so everyone sees the same list."
        },
        securityAlerts: {
          title: "Alerts for important moments",
          description: "You get an email when transactions are exported, two-factor authentication is turned on, or the account is deleted."
        },
        export: {
          title: "Export transactions",
          description: "Download your transactions and work with them anywhere else."
        },
        import: {
          title: "Import old transactions",
          description: "Bring over your history from earlier tools, so you don't start from zero."
        },
        stats: {
          title: "Statistics",
          description: "Several charts and summaries show where the money goes."
        }
      }
    },
  },
  footer: {
    copyright: "- © Júlia Simon 2021 -",
  },
  dyslexicToggle: {
    dyslexicMode: "Dyslexia friendly mode",
    dyslexicModeDisclaimer: "Your preference will be saved to your browser's localstorage so that it will persist even when you change pages. By using the button, you accept this saving method. The website operator does not see this and does not save it in any other way. It is on your own computer.",
    settings: "Settings"
  },
  sqlQuiz: {
    metaTitle: "SQL Quiz | Simon Júlia - Web developer",
    metaDescription: "Test your PostgreSQL knowledge with a free interactive quiz across beginner, intermediate and expert levels.",
    heading: "PostgreSQL SQL Quiz",
    intro: "Pick a difficulty level to start a 15-question quiz on PostgreSQL. Learn the right mental models, keywords and gotchas so you can confidently review a PR with queries.",
    levelSelect: {
      heading: "Choose your level",
      beginnerLabel: "Beginner",
      beginnerDescription: "Basic SELECT statements, filtering, sorting and simple joins.",
      intermediateLabel: "Intermediate",
      intermediateDescription: "Multi-table joins, subqueries, CTEs and aggregations.",
      expertLabel: "Expert",
      expertDescription: "Window functions, indexing, locking and lesser-known keywords.",
      startButton: "Start quiz"
    },
    quiz: {
      progressTemplate: "Question {current} of {total}",
      correctFeedback: "Correct!",
      incorrectFeedback: "Incorrect",
      explanationLabel: "Explanation",
      nextButton: "Next question"
    },
    results: {
      heading: "Quiz complete",
      scoreTemplate: "You scored {score} out of {total}",
      playAgainButton: "Play again",
      changeLevelButton: "Choose another level"
    }
  }
};