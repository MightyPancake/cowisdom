const AIRTABLE_API_TOKEN = 'patxBzde6f82PubHD.c094186be828f6c79d1333e654ea603e412bb6a1629706763aaff4c1fbb7079d';
const BASE_ID = 'appuIM6nNhskdWUXd';
const TABLE_NAME = 'fortune';
const MAX_LINE_LENGTH = 50;

async function fetchQuote() {
  const dateParam = getUrlParam('date');
  const dateToUse = dateParam ? new Date(dateParam.split('-').reverse().join('-')) : new Date();

  // Set title and date immediately
  document.getElementById('title').textContent = "Today's wisdom";
  document.getElementById('date').textContent = formatDate(dateToUse);

  // Hide or show nextDay button depending on whether the date is today
  const today = new Date();
  if (
    dateToUse.getFullYear() === today.getFullYear() &&
    dateToUse.getMonth() === today.getMonth() &&
    dateToUse.getDate() === today.getDate()
  ) {
    const nextButton = document.getElementById('nextDay');
    nextButton.style.visibility = 'hidden';  // invisible but space reserved
    nextButton.style.pointerEvents = 'none'; // not clickable
  } else {
    const nextButton = document.getElementById('nextDay');
    nextButton.style.visibility = 'visible';
    nextButton.style.pointerEvents = 'auto';
  }

  renderCowsay("I'm loading...");

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=IS_SAME({date}, '${formatDateForAirtable(dateToUse)}', 'day')&maxRecords=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
      }
    });

    const data = await response.json();

    if (data.records && data.records.length > 0) {
      const quote = data.records[0].fields.quote;
      renderCowsay(quote);
    } else {
      if (isSameDay(dateToUse, today)) {
        startCountdownToMidnight();
      } else {
        renderCowsay('404 - Wisdom not found!');
      }
    }
  } catch (error) {
    if (isSameDay(dateToUse, today)) {
      startCountdownToMidnight();
    } else {
      renderCowsay('404 - Wisdom not found!');
    }
  }
}

function renderCowsay(text) {
  const paragraphs = text.split('\n'); // split hard lines first!
  let lines = [];

  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') {
      lines.push('');
    } else {
      const wrapped = splitTextIntoLines(paragraph, MAX_LINE_LENGTH);
      lines = lines.concat(wrapped);
    }
  });

  const maxLineLength = Math.max(...lines.map(line => line.length));
  const paddedLines = lines.map(line => line.padEnd(maxLineLength, ' '));
  const topBorder = '_'.repeat(maxLineLength);
  const topBorder2 = '/' + ' '.repeat(maxLineLength) + '\\';
  const bottomBorder = '\\' + '_'.repeat(maxLineLength) + '/';

  const cowArt = `  ${topBorder}
 ${topBorder2}
${paddedLines.map(line => `| ${line} |`).join('\n')}
 ${bottomBorder}
           \\  |
            \\ | ^__^                          
             \\| (oo)\\_______                 
              \\ (__)\\       )\\/\\            
                    ||----w |                  
                    ||     ||`;

  document.getElementById('cowsay').textContent = cowArt;
}

function splitTextIntoLines(text, maxLength) {
  text = text.replace(/\t/g, '    ');  // Replace tabs with 4 spaces

  const tokens = text.split(/(\s+|\n)/);
  let lines = [];
  let currentLine = '';

  tokens.forEach(token => {
    if (token === '\n') {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if ((currentLine + token).length > maxLength) {
      lines.push(currentLine);
      currentLine = token.trimStart();
    } else {
      currentLine += token;
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  return lines;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function formatDateForAirtable(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function changeDateBy(days) {
  const dateParam = getUrlParam('date');
  let currentDate = dateParam ? new Date(dateParam.split('-').reverse().join('-')) : new Date();

  currentDate.setDate(currentDate.getDate() + days);

  const newDateStr = formatDate(currentDate);
  const url = new URL(window.location);
  url.searchParams.set('date', newDateStr);
  window.location.href = url.toString(); // reloads with new date param
}

// Countdown until midnight UTC
function startCountdownToMidnight() {
  function updateCountdown() {
    const now = new Date();
    const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)); // Next midnight UTC

    const diffMs = midnightUTC - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const countdownText = `I'm glad you long for wisdom!\nGreat knowledge requires much thought though...\nGive me roughly ${hours}h ${minutes}m ${seconds}s.`;
    renderCowsay(countdownText);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000); // Update every second
}

// Helper function to compare if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Listeners
document.getElementById('prevDay').addEventListener('click', () => {
  changeDateBy(-1);
});

document.getElementById('nextDay').addEventListener('click', () => {
  changeDateBy(1);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    // Simulate previous day
    document.getElementById('prevDay').click();
  } else if (event.key === 'ArrowRight') {
    // Simulate next day
    const nextButton = document.getElementById('nextDay');
    if (nextButton.style.visibility !== 'hidden') {
      nextButton.click();
    }
  }
});

fetchQuote();
