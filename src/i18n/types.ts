export type Translation = {
  metaDescription: string;
  nav: {
    blog: string;
    about: string;
    projects: string;
    sqlQuiz: string;
  };
  digitalGarden: {
    definition: string;
    introduction: string;
  };
  about: {
    degree: string;
    programmingRoots: string;
    programmingWhy: string;
    experience: string;
    choiceOfWeapon: string;
    hobbies: string;
  };
  projects: {
    description: string;
    persevereDescription: string;
    plastic3matchDescription: string;
    balloonDescription: string;
  };
  footer: {
    copyright: string;
  };
  dyslexicToggle: {
    dyslexicMode: string;
    dyslexicModeDisclaimer: string;
    settings: string;
  };
  sqlQuiz: {
    metaTitle: string;
    metaDescription: string;
    heading: string;
    intro: string;
    levelSelect: {
      heading: string;
      beginnerLabel: string;
      beginnerDescription: string;
      intermediateLabel: string;
      intermediateDescription: string;
      expertLabel: string;
      expertDescription: string;
      startButton: string;
    };
    quiz: {
      progressTemplate: string;
      correctFeedback: string;
      incorrectFeedback: string;
      explanationLabel: string;
      nextButton: string;
    };
    results: {
      heading: string;
      scoreTemplate: string;
      playAgainButton: string;
      changeLevelButton: string;
    };
  };
};