// アプリケーションのメインクラス
class RadioApp {
    constructor() {
        this.audio = new Audio();
        this.episodes = [];
        this.currentEpisode = null;
        this.isPlaying = false;
        this.isLoading = false;
        this.currentSpeed = 1;
        this.currentCommentEpisode = null;
        
        // DOM要素の取得
        this.elements = {
            episodesList: document.getElementById('episodesList'),
            audioPlayer: document.getElementById('audioPlayer'),
            episodeCover: document.getElementById('episodeCover'),
            episodeTitle: document.getElementById('episodeTitle'),
            episodeDescription: document.getElementById('episodeDescription'),
            playBtn: document.getElementById('playBtn'),
            progressBar: document.getElementById('progressBar'),
            progressFill: document.getElementById('progressFill'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            volumeBtn: document.getElementById('volumeBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            notificationBtn: document.getElementById('notificationBtn'),
            notificationModal: document.getElementById('notificationModal'),
            allowNotifications: document.getElementById('allowNotifications'),
            denyNotifications: document.getElementById('denyNotifications'),
            loading: document.getElementById('loading'),
            speedButtons: document.querySelectorAll('.speed-btn'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            commentModal: document.getElementById('commentModal'),
            commentModalTitle: document.getElementById('commentModalTitle'),
            commentText: document.getElementById('commentText'),
            sendComment: document.getElementById('sendComment'),
            cancelComment: document.getElementById('cancelComment'),
            closeCommentModal: document.getElementById('closeCommentModal'),
            commentsList: document.getElementById('commentsList')
        };
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.setupAudioEventListeners();
        await this.loadEpisodes();
        this.setupServiceWorker();
        this.checkNotificationPermission();
    }
    
    // イベントリスナーの設定
    setupEventListeners() {
        // プレイボタン
        this.elements.playBtn.addEventListener('click', () => this.togglePlayPause());
        
        // プログレスバー
        this.elements.progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        // 音量スライダー
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 音量ボタン
        this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
        
        // 再生速度ボタン
        this.elements.speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setPlaybackSpeed(parseFloat(e.target.dataset.speed)));
        });
        
        // フィルターボタン
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterEpisodes(e.target.dataset.filter));
        });
        
        // 通知ボタン
        this.elements.notificationBtn.addEventListener('click', () => this.showNotificationModal());
        
        // 通知モーダル
        this.elements.allowNotifications.addEventListener('click', () => this.requestNotificationPermission());
        this.elements.denyNotifications.addEventListener('click', () => this.hideNotificationModal());
        
        // モーダル外クリックで閉じる
        this.elements.notificationModal.addEventListener('click', (e) => {
            if (e.target === this.elements.notificationModal) {
                this.hideNotificationModal();
            }
        });
        
        // コメントモーダル
        this.elements.sendComment.addEventListener('click', () => this.sendComment());
        this.elements.cancelComment.addEventListener('click', () => this.hideCommentModal());
        this.elements.closeCommentModal.addEventListener('click', () => this.hideCommentModal());
        
        // モーダル外クリックで閉じる
        this.elements.commentModal.addEventListener('click', (e) => {
            if (e.target === this.elements.commentModal) {
                this.hideCommentModal();
            }
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    // オーディオイベントリスナーの設定
    setupAudioEventListeners() {
        this.audio.addEventListener('loadstart', () => this.showLoading());
        this.audio.addEventListener('canplay', () => this.hideLoading());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        
        // 音量の初期設定
        this.audio.volume = 1.0;
    }
    
    // エピソードの読み込み
    async loadEpisodes() {
        try {
            this.showLoading();
            const response = await fetch('episodes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.episodes = data.episodes;
            this.renderEpisodes();
            this.hideLoading();
        } catch (error) {
            console.error('エピソードの読み込みに失敗しました:', error);
            this.showError('エピソードの読み込みに失敗しました');
            this.hideLoading();
        }
    }
    
    // エピソード一覧の描画
    renderEpisodes(filter = 'all') {
        this.elements.episodesList.innerHTML = '';
        
        let filteredEpisodes = this.episodes;
        
        // フィルターの適用
        if (filter === 'recent') {
            filteredEpisodes = this.episodes
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, 5);
        } else if (filter === 'popular') {
            // 人気順のロジック（例：再生回数や日付ベース）
            filteredEpisodes = this.episodes
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, 3);
        }
        
        filteredEpisodes.forEach(episode => {
            const episodeCard = this.createEpisodeCard(episode);
            this.elements.episodesList.appendChild(episodeCard);
        });
        
        // いいね状態を復元
        this.restoreLikeStates();
    }
    
    // エピソードカードの作成
    createEpisodeCard(episode) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.dataset.episodeId = episode.id;
        
        const publishedDate = new Date(episode.publishedAt).toLocaleDateString('ja-JP');
        
        card.innerHTML = `
            <img class="episode-cover-small" src="${episode.coverImage}" alt="${episode.title}" loading="lazy">
            <div class="episode-content">
                <h3 class="episode-title-small">${episode.title}</h3>
                <p class="episode-description-small">${episode.description}</p>
                <div class="episode-meta">
                    <span class="episode-date">${publishedDate}</span>
                    <span class="episode-duration">${episode.duration}</span>
                </div>
                <div class="episode-actions">
                    <button class="like-btn" data-episode-id="${episode.id}">
                        <span class="like-icon">❤️</span>
                        <span class="like-count">${episode.likes || 0}</span>
                    </button>
                    <button class="comment-btn" data-episode-id="${episode.id}">
                        <span class="comment-icon">💬</span>
                        <span class="comment-count">${episode.comments?.length || 0}</span>
                    </button>
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            // いいねボタンやコメントボタンがクリックされた場合は再生しない
            if (e.target.closest('.like-btn') || e.target.closest('.comment-btn')) {
                return;
            }
            this.playEpisode(episode);
        });
        
        // いいねボタンのイベントリスナー
        const likeBtn = card.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLike(episode.id);
        });
        
        // コメントボタンのイベントリスナー
        const commentBtn = card.querySelector('.comment-btn');
        commentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCommentModal(episode);
        });
        
        return card;
    }
    
    // エピソードの再生
    async playEpisode(episode) {
        try {
            // 現在のエピソードを更新
            this.currentEpisode = episode;
            
            // オーディオソースを設定
            this.audio.src = episode.audioUrl;
            
            // UIの更新
            this.updatePlayerUI(episode);
            this.updateActiveEpisodeCard(episode.id);
            this.showPlayer();
            
            // 再生開始
            await this.audio.play();
            
            // メディアセッションの更新
            this.updateMediaSession(episode);
            
        } catch (error) {
            console.error('エピソードの再生に失敗しました:', error);
            this.showError('エピソードの再生に失敗しました');
        }
    }
    
    // プレイヤーUIの更新
    updatePlayerUI(episode) {
        this.elements.episodeCover.src = episode.coverImage;
        this.elements.episodeCover.alt = episode.title;
        this.elements.episodeTitle.textContent = episode.title;
        this.elements.episodeDescription.textContent = episode.description;
    }
    
    // アクティブなエピソードカードの更新
    updateActiveEpisodeCard(episodeId) {
        // 全てのカードからactiveクラスを削除
        document.querySelectorAll('.episode-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // 現在のエピソードカードにactiveクラスを追加
        const activeCard = document.querySelector(`[data-episode-id="${episodeId}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    }
    
    // プレイヤーの表示
    showPlayer() {
        this.elements.audioPlayer.classList.add('visible');
    }
    
    // 再生/一時停止の切り替え
    async togglePlayPause() {
        if (!this.currentEpisode) return;
        
        try {
            if (this.isPlaying) {
                this.audio.pause();
            } else {
                await this.audio.play();
            }
        } catch (error) {
            console.error('再生/一時停止に失敗しました:', error);
            this.showError('再生/一時停止に失敗しました');
        }
    }
    
    // 再生開始時の処理
    onPlay() {
        this.isPlaying = true;
        this.elements.playBtn.classList.add('playing');
    }
    
    // 一時停止時の処理
    onPause() {
        this.isPlaying = false;
        this.elements.playBtn.classList.remove('playing');
    }
    
    // 再生終了時の処理
    onEnded() {
        this.isPlaying = false;
        this.elements.playBtn.classList.remove('playing');
        this.elements.progressFill.style.width = '0%';
        this.elements.currentTime.textContent = '0:00';
    }
    
    // プログレスの更新
    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.elements.progressFill.style.width = `${progress}%`;
            this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    // 再生時間の更新
    updateDuration() {
        if (this.audio.duration) {
            this.elements.duration.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    // 時間のフォーマット
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // シーク機能
    seekTo(event) {
        if (!this.audio.duration) return;
        
        const rect = this.elements.progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = percentage * this.audio.duration;
        
        this.audio.currentTime = newTime;
    }
    
    // 音量の設定
    setVolume(value) {
        const volume = value / 100;
        this.audio.volume = volume;
    }
    
    // ミュートの切り替え
    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            this.elements.volumeSlider.value = 0;
        } else {
            this.audio.volume = 1.0;
            this.elements.volumeSlider.value = 100;
        }
    }
    
    // 再生速度の設定
    setPlaybackSpeed(speed) {
        this.currentSpeed = speed;
        this.audio.playbackRate = speed;
        
        // 速度ボタンのアクティブ状態を更新
        this.elements.speedButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.speed) === speed) {
                btn.classList.add('active');
            }
        });
    }
    
    // エピソードのフィルタリング
    filterEpisodes(filter) {
        // フィルターボタンのアクティブ状態を更新
        this.elements.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        // エピソードの表示を更新
        this.renderEpisodes(filter);
    }
    
    // メディアセッションの更新
    updateMediaSession(episode) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: episode.title,
                artist: 'ラジオアプリ',
                album: 'エピソード',
                artwork: [
                    { src: episode.coverImage, sizes: '400x400', type: 'image/png' }
                ]
            });
            
            // メディアセッションアクションの設定
            navigator.mediaSession.setActionHandler('play', () => this.audio.play());
            navigator.mediaSession.setActionHandler('pause', () => this.audio.pause());
            navigator.mediaSession.setActionHandler('seekbackward', () => {
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
            });
            navigator.mediaSession.setActionHandler('seekforward', () => {
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
            });
        }
    }
    
    // キーボードショートカット
    handleKeyboardShortcuts(event) {
        if (event.target.tagName === 'INPUT') return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
                break;
            case 'KeyM':
                event.preventDefault();
                this.toggleMute();
                break;
            case 'Digit1':
                event.preventDefault();
                this.setPlaybackSpeed(1);
                break;
            case 'Digit2':
                event.preventDefault();
                this.setPlaybackSpeed(1.5);
                break;
            case 'Digit3':
                event.preventDefault();
                this.setPlaybackSpeed(2);
                break;
        }
    }
    
    // 通知権限の確認
    checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.elements.notificationBtn.style.opacity = '1';
            } else {
                this.elements.notificationBtn.style.opacity = '0.5';
            }
        }
    }
    
    // 通知モーダルの表示
    showNotificationModal() {
        this.elements.notificationModal.classList.add('visible');
    }
    
    // 通知モーダルの非表示
    hideNotificationModal() {
        this.elements.notificationModal.classList.remove('visible');
    }
    
    // 通知権限のリクエスト
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.elements.notificationBtn.style.opacity = '1';
                this.showSuccess('通知が有効になりました');
            } else {
                this.showError('通知が拒否されました');
            }
        }
        this.hideNotificationModal();
    }
    
    // Service Workerの設定
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker登録成功:', registration);
            } catch (error) {
                console.error('Service Worker登録失敗:', error);
            }
        }
    }
    
    // ローディング表示
    showLoading() {
        this.isLoading = true;
        this.elements.loading.classList.add('visible');
    }
    
    // ローディング非表示
    hideLoading() {
        this.isLoading = false;
        this.elements.loading.classList.remove('visible');
    }
    
    // エラー表示
    showError(message) {
        // 簡単なエラー表示（実際のアプリではより詳細なエラーハンドリングを実装）
        alert(message);
    }
    
    // 成功メッセージ表示
    showSuccess(message) {
        // 簡単な成功メッセージ表示
        alert(message);
    }
    
    // オーディオエラーの処理
    onAudioError(event) {
        console.error('オーディオエラー:', event);
        this.showError('音声の再生中にエラーが発生しました');
        this.hideLoading();
    }
    
    // いいね機能
    toggleLike(episodeId) {
        const episode = this.episodes.find(ep => ep.id === episodeId);
        if (!episode) return;
        
        // ローカルストレージからいいね状態を取得
        const likedEpisodes = JSON.parse(localStorage.getItem('likedEpisodes') || '[]');
        const isLiked = likedEpisodes.includes(episodeId);
        
        if (isLiked) {
            // いいねを取り消し
            episode.likes = Math.max(0, episode.likes - 1);
            likedEpisodes.splice(likedEpisodes.indexOf(episodeId), 1);
        } else {
            // いいねを追加
            episode.likes = (episode.likes || 0) + 1;
            likedEpisodes.push(episodeId);
        }
        
        // ローカルストレージに保存
        localStorage.setItem('likedEpisodes', JSON.stringify(likedEpisodes));
        
        // UIを更新
        this.updateLikeButton(episodeId, !isLiked);
        this.updateLikeCount(episodeId, episode.likes);
    }
    
    // いいねボタンの状態を更新
    updateLikeButton(episodeId, isLiked) {
        const likeBtn = document.querySelector(`[data-episode-id="${episodeId}"] .like-btn`);
        if (likeBtn) {
            if (isLiked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
        }
    }
    
    // いいね数を更新
    updateLikeCount(episodeId, count) {
        const likeCount = document.querySelector(`[data-episode-id="${episodeId}"] .like-count`);
        if (likeCount) {
            likeCount.textContent = count;
        }
    }
    
    // コメントモーダルを表示
    showCommentModal(episode) {
        this.currentCommentEpisode = episode;
        this.elements.commentModalTitle.textContent = `${episode.title} - コメント`;
        this.elements.commentText.value = '';
        this.renderComments(episode.comments || []);
        this.elements.commentModal.classList.add('visible');
    }
    
    // コメントモーダルを非表示
    hideCommentModal() {
        this.elements.commentModal.classList.remove('visible');
        this.currentCommentEpisode = null;
    }
    
    // コメントを送信
    async sendComment() {
        if (!this.currentCommentEpisode) return;
        
        const commentText = this.elements.commentText.value.trim();
        if (!commentText) {
            this.showError('コメントを入力してください');
            return;
        }
        
        try {
            // 新しいコメントを作成
            const newComment = {
                id: Date.now().toString(),
                text: commentText,
                author: 'リスナー',
                date: new Date().toISOString(),
                episodeId: this.currentCommentEpisode.id
            };
            
            // エピソードのコメント配列に追加
            if (!this.currentCommentEpisode.comments) {
                this.currentCommentEpisode.comments = [];
            }
            this.currentCommentEpisode.comments.push(newComment);
            
            // メール送信
            await this.sendEmailNotification(newComment);
            
            // UIを更新
            this.renderComments(this.currentCommentEpisode.comments);
            this.updateCommentCount(this.currentCommentEpisode.id, this.currentCommentEpisode.comments.length);
            this.elements.commentText.value = '';
            
            this.showSuccess('コメントを送信しました');
            
        } catch (error) {
            console.error('コメント送信エラー:', error);
            this.showError('コメントの送信に失敗しました');
        }
    }
    
    // メール通知を送信
    async sendEmailNotification(comment) {
        const episode = this.episodes.find(ep => ep.id === comment.episodeId);
        const subject = `Radioアプリ - 新しいコメント: ${episode?.title || 'Unknown Episode'}`;
        const body = `
エピソード: ${episode?.title || 'Unknown Episode'}
コメント: ${comment.text}
投稿者: ${comment.author}
日時: ${new Date(comment.date).toLocaleString('ja-JP')}
        `.trim();
        
        // mailtoリンクを作成
        const mailtoLink = `mailto:satoru.slash5150@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // メールクライアントを開く
        window.open(mailtoLink);
    }
    
    // コメント一覧を表示
    renderComments(comments) {
        const commentsList = this.elements.commentsList;
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">まだコメントがありません</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            
            const commentDate = new Date(comment.date).toLocaleDateString('ja-JP');
            
            commentItem.innerHTML = `
                <div class="comment-text">${comment.text}</div>
                <div class="comment-meta">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${commentDate}</span>
                </div>
            `;
            
            commentsList.appendChild(commentItem);
        });
    }
    
    // コメント数を更新
    updateCommentCount(episodeId, count) {
        const commentCount = document.querySelector(`[data-episode-id="${episodeId}"] .comment-count`);
        if (commentCount) {
            commentCount.textContent = count;
        }
    }
    
    // いいね状態を復元
    restoreLikeStates() {
        const likedEpisodes = JSON.parse(localStorage.getItem('likedEpisodes') || '[]');
        likedEpisodes.forEach(episodeId => {
            this.updateLikeButton(episodeId, true);
        });
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new RadioApp();
});
