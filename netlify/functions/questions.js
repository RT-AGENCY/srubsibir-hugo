// netlify/functions/questions.js

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Получаем переменные окружения
    const AIRTABLE_API_KEY = process.env.AIR_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = 'questions';

    console.log('=== QUESTIONS FORM DEBUG ===');
    console.log('API Key exists:', !!AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!AIRTABLE_BASE_ID);
    console.log('Table name:', AIRTABLE_TABLE_NAME);

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Server configuration error' })
      };
    }

    // Парсим данные
    const data = JSON.parse(event.body);
    console.log('Incoming questions data:', data);
    
    // Валидация обязательных полей
    if (!data.name || !data.email || !data.phone || !data.country) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Required fields: name, email, phone, country' 
        })
      };
    }

    // Подготавливаем данные для Airtable
    const airtableData = {
      fields: {
        Name: data.name.trim(),
        Email: data.email.trim(),
        Phone: data.phone.trim(),
        Country: data.country.trim(),
        Status: 'Новая',
        Source: 'Сайт',
        Done: false
      }
    };

    // Добавляем опциональные поля только если они не пустые
    if (data.location && data.location.trim()) {
      airtableData.fields.Location = data.location.trim();
    }
    
    if (data.diameter && data.diameter.trim()) {
      // Маппинг значений диаметра
      const diameterMap = {
        '40-50': 'Бревно 40 - 50 см',
        '50-60': 'Бревно 50 - 60 см', 
        '60-70': 'Бревно 60 - 70 см',
        '70+': 'Бревно 70 см +'
      };
      airtableData.fields.Diameter = diameterMap[data.diameter] || data.diameter.trim();
    }
    
    if (data.delivery_date && data.delivery_date.trim()) {
      // Маппинг значений даты
      const dateMap = {
        'soon': 'В ближайшее время',
        'year': 'В течение года'
      };
      airtableData.fields['Delivery Date'] = dateMap[data.delivery_date] || data.delivery_date.trim();
    }
    
    if (data.completeness && data.completeness.trim()) {
      // Маппинг значений из формы
      const completenessMap = {
        'roof': 'Сруб под крышу',
        'materials': 'Сруб и отделочные материалы', 
        'turnkey': 'Сруб дома или бани под ключ'
      };
      airtableData.fields.Completeness = completenessMap[data.completeness] || data.completeness;
    }

    // Добавляем заметки с дополнительной информацией
    let notes = [];
    if (data.page_url) notes.push(`URL: ${data.page_url}`);
    if (data.utm_source) notes.push(`UTM Source: ${data.utm_source}`);
    if (data.utm_medium) notes.push(`UTM Medium: ${data.utm_medium}`);
    if (data.utm_campaign) notes.push(`UTM Campaign: ${data.utm_campaign}`);
    
    if (notes.length > 0) {
      airtableData.fields.Notes = notes.join('\n');
    }

    console.log('Sending to Airtable:', JSON.stringify(airtableData, null, 2));

    // Отправляем в Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const result = await sendToAirtable(airtableData, AIRTABLE_API_KEY, airtableUrl);

    if (!result.success) {
      console.error('Airtable error:', result.error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: result.error })
      };
    }

    console.log('Success! Questions record created:', result.data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Вопрос успешно отправлен',
        record: result.data
      })
    };

  } catch (error) {
    console.error('Questions function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error: ' + error.message
      })
    };
  }
};

async function sendToAirtable(data, apiKey, url) {
  const https = require('https');
  const urlModule = require('url');
  
  const parsedUrl = urlModule.parse(url);
  const postData = JSON.stringify(data);
  
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Airtable response status:', res.statusCode);
        console.log('Airtable response data:', responseData);
        
        try {
          const parsed = JSON.parse(responseData);
          
          if (res.statusCode === 200) {
            resolve({ success: true, data: parsed });
          } else {
            const errorMessage = parsed.error?.message || `HTTP ${res.statusCode}`;
            resolve({ success: false, error: errorMessage });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          resolve({ success: false, error: `Parse error: ${responseData}` });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve({ success: false, error: 'Network error: ' + error.message });
    });
    
    req.write(postData);
    req.end();
  });
}