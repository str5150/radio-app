// Service Worker for Radio App
// バックグラウンド再生とプッシュ通知をサポート

const CACHE_NAME = 'radio-app-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/episodes.json',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
    console.log('Service Worker: インストール中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: キャッシュを開きました');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: インストール完了');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: インストールエラー', error);
            })
    );
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
    console.log('Service Worker: アクティベート中...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: 古いキャッシュを削除:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: アクティベート完了');
                return self.clients.claim();
            })
    );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
    // 音声ファイルの場合はネットワークファースト
    if (event.request.url.includes('.mp3') || event.request.url.includes('.wav') || event.request.url.includes('.m4a')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // ネットワークエラーの場合はキャッシュから取得
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // その他のリソースはキャッシュファースト
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // 有効なレスポンスかチェック
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // オフライン時のフォールバック
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
    console.log('Service Worker: プッシュ通知を受信');
    
    let notificationData = {
        title: 'ラジオアプリ',
        body: '新しいエピソードが公開されました！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'new-episode',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'アプリを開く',
                icon: '/icons/icon-192x192.png'
            },
            {
                action: 'dismiss',
                title: '閉じる'
            }
        ]
    };
    
    // カスタムデータがある場合は使用
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('プッシュデータの解析エラー:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: 通知がクリックされました');
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    // アプリを開く
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // 既に開いているウィンドウがあるかチェック
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // 新しいウィンドウを開く
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// バックグラウンド同期の処理
self.addEventListener('sync', (event) => {
    console.log('Service Worker: バックグラウンド同期', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // ここでオフライン時のデータ同期処理を実装
            syncOfflineData()
        );
    }
});

// オフラインデータの同期
async function syncOfflineData() {
    try {
        // オフライン時の操作を同期する処理
        console.log('オフラインデータを同期中...');
        
        // 実際のアプリでは、IndexedDBやlocalStorageから
        // オフライン時の操作を取得して同期する
        
    } catch (error) {
        console.error('データ同期エラー:', error);
    }
}

// メッセージの処理
self.addEventListener('message', (event) => {
    console.log('Service Worker: メッセージを受信', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// エラーハンドリング
self.addEventListener('error', (event) => {
    console.error('Service Worker: エラーが発生', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: 未処理のPromise拒否', event.reason);
});

// バックグラウンドでの音声再生をサポート
// 注意: 実際のバックグラウンド再生は、ブラウザの制限により
// 完全に制御することはできませんが、Service Workerで
// メディアセッションの更新や通知の管理を行います
