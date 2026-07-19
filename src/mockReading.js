/**
 * Simulates a highly detailed, dynamic, context-aware tarot reading locally
 * and streams the JSON response chunk-by-chunk.
 */
export function generateMockReading({ sessionType, cards, question, positions, lang, onChunk, onDone }) {
  // 1. Extract original question & chosen clarifications
  const questionParts = question.split("\n\nSeeker's Clarifications");
  const originalQuestion = questionParts[0].trim();
  const clarifications = [];
  const matches = [...question.matchAll(/Chosen Clarification: "([^"]+)"/g)];
  for (const match of matches) {
    clarifications.push(match[1]);
  }

  // 2. Detect category based on keywords
  const q = originalQuestion.toLowerCase();
  let category = "general";
  if (q.includes("love") || q.includes("relationship") || q.includes("ex") || q.includes("marry") || q.includes("romance") || q.includes("любов") || q.includes("стосунк") || q.includes("кохан") || q.includes("дружин") || q.includes("чоловік")) {
    category = "love";
  } else if (q.includes("work") || q.includes("job") || q.includes("career") || q.includes("money") || q.includes("business") || q.includes("finance") || q.includes("робот") || q.includes("кар'єр") || q.includes("грош") || q.includes("бізнес")) {
    category = "career";
  } else if (q.includes("spirit") || q.includes("soul") || q.includes("mind") || q.includes("self") || q.includes("grow") || q.includes("дух") || q.includes("душ") || q.includes("розвит") || q.includes("розум")) {
    category = "spiritual";
  }

  // 3. Build introduction dynamically
  let intro = "";
  if (lang === "uk") {
    intro = `Вітаємо у вашому особистому розкладі. Ми налаштувалися на ваше запитання: "${originalQuestion}". `;
    if (clarifications.length > 0) {
      intro += `Беручи до уваги, що наразі ви відчуваєте: "${clarifications.join(", ")}", карти відкривають особливий простір для розуміння. `;
    }
    if (category === "love") {
      intro += "Енергія любові та емоційного зв'язку зараз проходить крізь глибокі трансформації. Дозвольте картам освітити приховані пласти ваших стосунків.";
    } else if (category === "career") {
      intro += "Сфера вашої реалізації та професійного шляху потребує чіткості. Карти розкривають приховані бар'єри та нові можливості для вашої кар'єри.";
    } else if (category === "spiritual") {
      intro += "Це подорож всередину себе. Карти вказують на важливі етапи духовного зростання, розкриваючи потреби вашої душі.";
    } else {
      intro += "Карти розкладені на оксамитовому столі, готові розкрити таємниці вашої долі. Давайте дослідимо ваш шлях.";
    }
  } else {
    // English
    intro = `Welcome to your personal reading. We have tuned into your question: "${originalQuestion}". `;
    if (clarifications.length > 0) {
      intro += `Considering that you are currently experiencing: "${clarifications.join(", ")}", the cards open a unique space of wisdom. `;
    }
    if (category === "love") {
      intro += "The energy of love and emotional connection is currently undergoing deep transformations. Let the cards illuminate the hidden layers of your relationship.";
    } else if (category === "career") {
      intro += "The realm of your realization and career path calls for clarity. The cards reveal hidden barriers and new opportunities for your professional growth.";
    } else if (category === "spiritual") {
      intro += "This is a journey inward. The cards highlight crucial stages of your spiritual evolution, addressing the deep calls of your soul.";
    } else {
      intro += "The cards are laid out on the velvet tablecloth, ready to reveal the secrets of your destiny. Let us explore your path.";
    }
  }

  // 4. Build interpretations dynamically
  const interpretations = cards.map((card, idx) => {
    const pos = positions[idx] || `Card ${idx + 1}`;
    const orientation = card.reversed ? (lang === "uk" ? "перевернуте положення" : "reversed") : (lang === "uk" ? "пряме положення" : "upright");
    const keywords = card.keywords.slice(0, 3).join(", ");
    
    let text = "";
    if (lang === "uk") {
      text = `Карта "${card.name}" (${orientation}) у позиції "${pos}" грає ключову роль у вашому запитанні. `;
      text += `Вона вказує на ${keywords}. `;
      if (category === "love") {
        text += `У контексті почуттів це свідчить, що емоційні аспекти цієї карти безпосередньо віддзеркалюють ваші сумніви та надії. `;
        if (card.reversed) {
          text += `Перевернуте положення застерігає від блокування емоцій або повторення старих образ. `;
        } else {
          text += `Пряме положення підтверджує щирість прагнень та необхідність відкритого діалогу. `;
        }
      } else if (category === "career") {
        text += `У питаннях роботи та фінансів ця карта закликає звернути увагу на професійні виклики. `;
        if (card.reversed) {
          text += `Це вказує на внутрішній супротив або дрібні перешкоди у справах, які потрібно вирішити найближчим часом. `;
        } else {
          text += `Це сприятливий знак для активних дій та реалізації задуманого плану. `;
        }
      } else {
        text += `Вона нагадує про баланс та внутрішню гармонію на вашому шляху. `;
      }
    } else {
      // English
      text = `The ${card.name} (${orientation}) in the "${pos}" position plays a crucial role in your query. `;
      text += `It points towards ${keywords}. `;
      if (category === "love") {
        text += `In the realm of relationships, this card reflects how these energies impact your emotional state. `;
        if (card.reversed) {
          text += `The reversed position warns against blocking your feelings or lingering on past hurts. `;
        } else {
          text += `The upright position confirms the sincerity of your desires and the necessity of honest communication. `;
        }
      } else if (category === "career") {
        text += `In matters of work and finance, this card urges you to focus on your professional challenges. `;
        if (card.reversed) {
          text += `This indicates internal resistance or minor delays in affairs that require your immediate attention. `;
        } else {
          text += `This is a highly promising sign for taking active steps and implementing your current strategy. `;
        }
      } else {
        text += `It serves as a reminder to seek balance and trust the natural flow of your journey. `;
      }
    }

    return {
      cardId: card.id,
      cardName: card.name,
      position: pos,
      text: text
    };
  });

  // 5. Build guidance dynamically
  let guidance = "";
  if (lang === "uk") {
    guidance = `Порада Оракула: Довіряйте своїй інтуїції. `;
    if (clarifications.length > 0) {
      guidance += `Пам'ятайте про свою відповідь: "${clarifications[0]}". Зверніть увагу, як саме цей фактор впливає на ваше прийняття рішень. `;
    }
    if (category === "love") {
      guidance += "У любові найголовніше — бути чесним із самим собою та партнером. Дозвольте старому болю відійти, щоб відкрити серце новому.";
    } else if (category === "career") {
      guidance += "У професійній сфері не бійтеся виявляти ініціативу та виходити за рамки буденності. Ваші зусилля принесуть плоди.";
    } else {
      guidance += "Пам'ятайте, що карти лише вказують шлях, але остаточний вибір та відповідальність за ваше життя завжди залишається за вами.";
    }
  } else {
    // English
    guidance = `Oracle's Advice: Trust your intuition. `;
    if (clarifications.length > 0) {
      guidance += `Keep in mind your reflection: "${clarifications[0]}". Observe how this pattern shapes your current choices. `;
    }
    if (category === "love") {
      guidance += "In love, the key is to remain true to yourself and communicate openly. Let go of past grievances to create space for a deeper connection.";
    } else if (category === "career") {
      guidance += "In your professional life, do not hesitate to show initiative and step outside your comfort zone. Your efforts will soon bear fruit.";
    } else {
      guidance += "Remember that the cards only show the path, but the ultimate choices and ownership of your destiny remain yours alone.";
    }
  }

  // 6. Build final mockResponse object
  const mockResponse = {
    introduction: intro,
    interpretations: interpretations,
    guidance: guidance,
    clarificationQuestions: originalQuestion
      ? (lang === "uk"
          ? ["Як ви можете змінити своє ставлення до проблеми?", "Що є вашим головним джерелом внутрішньої сили?"]
          : ["How can you shift your perspective on this issue?", "What is your primary source of inner strength?"])
      : []
  };

  const jsonString = JSON.stringify(mockResponse, null, 2);
  
  // Simulate streaming chunk by chunk
  let index = 0;
  const interval = setInterval(() => {
    if (index >= jsonString.length) {
      clearInterval(interval);
      onDone();
      return;
    }
    const chunk = jsonString.slice(index, index + 20);
    onChunk(chunk);
    index += 20;
  }, 10);
}
