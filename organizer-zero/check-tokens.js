// Скрипт для проверки токенов в консоли браузера
// Запустите этот код в консоли разработчика (F12)

console.log('🔍 Проверка токенов в localStorage...');

// Проверяем все ключи в localStorage
const tokens = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
        const value = localStorage.getItem(key);
        tokens.push({ key, value });
    }
}

if (tokens.length === 0) {
    console.log('❌ Токены не найдены в localStorage');
} else {
    console.log(`✅ Найдено токенов: ${tokens.length}`);
    console.table(tokens);
    
    // Проверяем конкретные ключи, которые могут содержать токены
    const importantKeys = [
        'oz_settings',
        'security_lock',
        'security_password',
        'theme'
    ];
    
    console.log('\n🔑 Проверка важных ключей:');
    importantKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`${key}: ${value}`);
        } else {
            console.log(`${key}: не найден`);
        }
    });
}

// Проверяем sessionStorage
console.log('\n📋 Проверка sessionStorage...');
const sessionTokens = [];
for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
        const value = sessionStorage.getItem(key);
        sessionTokens.push({ key, value });
    }
}

if (sessionTokens.length === 0) {
    console.log('❌ Токены не найдены в sessionStorage');
} else {
    console.log(`✅ Найдено токенов в sessionStorage: ${sessionTokens.length}`);
    console.table(sessionTokens);
}

// Проверяем cookies
console.log('\n🍪 Проверка cookies...');
const cookies = document.cookie.split(';').map(cookie => {
    const [name, value] = cookie.trim().split('=');
    return { name, value };
});

if (cookies.length === 0 || (cookies.length === 1 && !cookies[0].name)) {
    console.log('❌ Cookies не найдены');
} else {
    console.log(`✅ Найдено cookies: ${cookies.length}`);
    console.table(cookies);
}