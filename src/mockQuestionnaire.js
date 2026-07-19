/**
 * Returns a static but relevant mock questionnaire for testing without API keys.
 * Matches the keyless JSON array structure returned by the live Gemini AI generator.
 * Dynamically customizes questions based on keywords in the seeker's query.
 */
export function getMockQuestionnaire(question, lang) {
  const q = (question || "").toLowerCase();
  
  let category = "general";
  if (q.includes("love") || q.includes("relationship") || q.includes("ex") || q.includes("marry") || q.includes("romance") || q.includes("любов") || q.includes("стосунк") || q.includes("кохан") || q.includes("dружин") || q.includes("чоловік")) {
    category = "love";
  } else if (q.includes("work") || q.includes("job") || q.includes("career") || q.includes("money") || q.includes("business") || q.includes("finance") || q.includes("робот") || q.includes("кар'єр") || q.includes("грош") || q.includes("бізнес")) {
    category = "career";
  } else if (q.includes("spirit") || q.includes("soul") || q.includes("mind") || q.includes("self") || q.includes("grow") || q.includes("дух") || q.includes("душ") || q.includes("розвит") || q.includes("розум")) {
    category = "spiritual";
  }

  if (lang === "uk") {
    if (category === "love") {
      return [
        {
          questionText: `Який аспект ваших взаємин стосовно запитання "${question}" хвилює вас найбільше?`,
          options: [
            "Страх бути відкинутим або втратити кохану людину",
            "Брак взаєморозуміння або емоційне віддалення",
            "Повторення старих болючих сценаріїв з минулого",
            "Невизначеність щодо майбутнього цих стосунків"
          ]
        },
        {
          questionText: "Які зовнішні чинники найбільше впливають на ваше романтичне життя?",
          options: [
            "Тиск і поради з боку родичів або друзів",
            "Побутові труднощі або фінансові суперечки",
            "Нестача спільного часу через завантаженість",
            "Потреба розібратися у власних почуттях наодинці"
          ]
        }
      ];
    } else if (category === "career") {
      return [
        {
          questionText: `Який професійний виклик стосовно запитання "${question}" є найактуальнішим?`,
          options: [
            "Потреба у фінансовому зростанні та стабільності",
            "Бажання змінити сферу діяльності або знайти покликання",
            "Конфлікти з колегами чи тиск з боку керівництва",
            "Невпевненість у своїх силах перед новими обов'язками"
          ]
        },
        {
          questionText: "Яка обставина заважає вашому кар'єрному просуванню?",
          options: [
            "Брак вільного часу або синдром вигорання",
            "Відсутність чіткої стратегії та плану дій",
            "Зовнішні обмеження на ринку праці або криза",
            "Страх вийти із зони комфорту та ризикнути"
          ]
        }
      ];
    } else if (category === "spiritual") {
      return [
        {
          questionText: `Що є головним фокусом вашого внутрішнього пошуку стосовно "${question}"?`,
          options: [
            "Пошук душевного спокою та подолання тривоги",
            "Бажання зрозуміти свої справжні життєві цінності",
            "Звільнення від старих переконань, що обмежують",
            "Зв'язок із вищим 'Я' та розвиток інтуїції"
          ]
        },
        {
          questionText: "Що найбільше заважає вашому духовному розвитку зараз?",
          options: [
            "Постоянний поспіх та занурення у матеріальні турботи",
            "Сумніви у правильності обраного життєвого шляху",
            "Брак внутрішньої дисципліни або наставництва",
            "Накопичені невиражені емоції чи образи"
          ]
        }
      ];
    } else {
      return [
        {
          questionText: `Що саме у вашому запитанні "${question}" викликає у вас найбільше занепокоєння зараз?`,
          options: [
            "Страх перед невідомим або невпевненість у майбутньому",
            "Потреба в контролі або небажання відпускати минуле",
            "Сумніви у власних силах або самокритика",
            "Бажання швидких змін без готовності до зусиль"
          ]
        },
        {
          questionText: "Які зовнішні обставини вас найбільше обмежують?",
          options: [
            "Тиск з боку оточення, родини або колег",
            "Фінансові труднощі чи матеріальна нестабільність",
            "Брак інформації або невизначеність ситуації",
            "Часові рамки або відчуття поспіху"
          ]
        }
      ];
    }
  } else {
    // English
    if (category === "love") {
      return [
        {
          questionText: `Which aspect of your relationship regarding "${question}" concerns you the most?`,
          options: [
            "Fear of rejection or losing the loved one",
            "Lack of mutual understanding or emotional distance",
            "Repeating old painful patterns from the past",
            "Uncertainty about the future of this relationship"
          ]
        },
        {
          questionText: "What external factors influence your romantic life the most?",
          options: [
            "Pressure and advice from relatives or friends",
            "Routine difficulties or financial disputes",
            "Lack of quality time together due to busyness",
            "The need to understand your own feelings alone"
          ]
        }
      ];
    } else if (category === "career") {
      return [
        {
          questionText: `Which professional challenge regarding "${question}" is the most pressing?`,
          options: [
            "The need for financial growth and stability",
            "Desire to change career field or find a calling",
            "Conflicts with colleagues or pressure from management",
            "Self-doubt and anxiety before new responsibilities"
          ]
        },
        {
          questionText: "What circumstance hinders your career advancement?",
          options: [
            "Lack of free time or burnout syndrome",
            "Absence of a clear strategy and action plan",
            "External labor market limitations or crisis",
            "Fear of leaving the comfort zone and taking risks"
          ]
        }
      ];
    } else if (category === "spiritual") {
      return [
        {
          questionText: `What is the primary focus of your inner search regarding "${question}"?`,
          options: [
            "Finding peace of mind and overcoming anxiety",
            "Desire to understand your true life values",
            "Release from old limiting beliefs and doubts",
            "Connection with your higher self and intuition development"
          ]
        },
        {
          questionText: "What hinders your spiritual growth the most right now?",
          options: [
            "Constant rush and immersion in material worries",
            "Doubts about the correctness of the chosen path",
            "Lack of inner discipline or spiritual guidance",
            "Accumulated unexpressed emotions or resentment"
          ]
        }
      ];
    } else {
      return [
        {
          questionText: `What details about your question "${question}" are causing you the most anxiety right now?`,
          options: [
            "Fear of the unknown or uncertainty about the future",
            "The need for control or reluctance to let go of the past",
            "Doubts about my own strength or self-criticism",
            "Desire for quick change without readiness for effort"
          ]
        },
        {
          questionText: "What external circumstances limit you the most right now?",
          options: [
            "Pressure from environment, family, or colleagues",
            "Financial difficulties or material instability",
            "Lack of information or uncertainty of the situation",
            "Timeframes or a sense of urgency"
          ]
        }
      ];
    }
  }
}
