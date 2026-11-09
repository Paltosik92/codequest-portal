// Совместимость прежней команды; проверки всех курсов используют один сценарий.
process.argv[2] ||= 'guild-of-heroes';
process.env.QA_REPORT_NAME ||= 'guild-browser-report.json';
await import('./course-browser-qa.mjs');
