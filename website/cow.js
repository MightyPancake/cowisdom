const AIRTABLE_API_TOKEN = 'patxBzde6f82PubHD.c094186be828f6c79d1333e654ea603e412bb6a1629706763aaff4c1fbb7079d';
const BASE_ID = 'appuIM6nNhskdWUXd';
const TABLE_NAME = 'fortune';
const MAX_LINE_LENGTH = 46;

async function fetchQuote() {
  // Get the date from the URL parameter or use today's date if not provided
  const dateParam = getUrlParam('date');
  const dateToUse = dateParam ? new Date(dateParam.split('-').reverse().join('-')) : new Date();

  // Display loading cow with "I'm loading..." message initially
  renderCowsay("I'm loading...", dateToUse);

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=IS_SAME({date}, '${formatDateForAirtable(dateToUse)}', 'day')&maxRecords=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
      }
    });

    // Check if the response is successful (status 200)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Check if data.records is available and contains a quote
    if (data.records && data.records.length > 0) {
      const quote = data.records[0].fields.quote;
      renderCowsay(quote, dateToUse);
    } else {
      renderCowsay('404 - Wisdom not found!', dateToUse);
    }
  } catch (error) {
    console.error('There was a problem fetching the quote:', error);
    renderCowsay('404 - Wisdom not found!', dateToUse);
  }
}

function renderCowsay(text, dateToUse) {
  const lines = splitTextIntoLines(text, MAX_LINE_LENGTH);
  
  // Ensure all lines are the same length by adding trailing spaces
  const maxLineLength = Math.max(...lines.map(line => line.length)); // Find the longest line
  const paddedLines = lines.map(line => line.padEnd(maxLineLength, ' ')); // Add spaces to each line to match the longest one

  const topBottomBorder = '-'.repeat(maxLineLength + 2); // Create the top/bottom border with the same width as the longest line
  // Add the date two lines below the cow
  const todayDate = formatDate(dateToUse);

  let cowArt = `                Today's wisdom

                
 ${topBottomBorder}
${paddedLines.map(line => `| ${line} |`).join('\n')}
 ${topBottomBorder}
            \\   ^__^
             \\  (oo)\\_______
                (__)\\       )\\/\\
                    ||----w |
                    ||     ||

                  ${todayDate}
                  `;

  document.getElementById('cowsay').textContent = cowArt;
}

// Function to split the quote into lines of MAX_LINE_LENGTH
function splitTextIntoLines(text, maxLength) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length < maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine); // Push the last line
  }

  return lines;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad single digit months, add 1 since getMonth() is 0-based
  const year = date.getFullYear(); // Get full year

  return `${day}-${month}-${year}`;
}

function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to format date as yyyy-mm-dd (Airtable format)
function formatDateForAirtable(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

fetchQuote();
