(function () {
  const audienceConfig = {
    recruiter: ['leaveflow', 'churn'],
    client: ['leaveflow', 'finance'],
    developer: ['leaveflow', 'finance', 'churn']
  };

  const caseStudyLinks = {
    leaveflow: 'https://github.com/bksharma1729/leaveflow',
    churn: 'https://github.com/bksharma1729/Customer-Churn-Prediction-Using-Machine-Learning',
    finance: 'https://github.com/bksharma1729/Finance-Tracker'
  };

  const sandboxMessages = {
    leaveflow: 'LeaveFlow sandbox is planned next. For now, the GitHub repository is the best live technical walkthrough.',
    churn: 'The churn project sandbox is not published yet. The repository currently serves as the project deep dive.',
    finance: 'Finance Tracker sandbox is still in progress. The repository is available while the live preview is being prepared.'
  };

  const buttons = document.querySelectorAll('.view-btn');
  const cards = document.querySelectorAll('.project-card[data-project-id]');

  function setView(view) {
    document.body.setAttribute('data-portfolio-view', view);

    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.view === view);
    });

    cards.forEach((card) => {
      const projectId = card.dataset.projectId;
      const shouldEmphasize = audienceConfig[view].includes(projectId);
      card.classList.toggle('is-emphasized', shouldEmphasize);
      card.classList.toggle('is-muted', !shouldEmphasize);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', function () {
      setView(button.dataset.view);
    });
  });

  document.querySelectorAll('[data-case-study]').forEach((button) => {
    button.addEventListener('click', function () {
      const projectId = button.dataset.caseStudy;
      const link = caseStudyLinks[projectId];
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    });
  });

  document.querySelectorAll('[data-sandbox]').forEach((button) => {
    button.addEventListener('click', function () {
      const projectId = button.dataset.sandbox;
      window.alert(sandboxMessages[projectId] || 'Live sandbox is coming soon.');
    });
  });

  const animatedElements = document.querySelectorAll('.animate-in');
  if ('IntersectionObserver' in window && animatedElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach((element) => observer.observe(element));
  }

  setView('recruiter');
})();
