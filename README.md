# Radioアプリ

StandFMのようなシンプルなウェブ版ラジオアプリです。PWA（プログレッシブ・ウェブアプリ）として実装され、バックグラウンド再生とプッシュ通知機能を備えています。

## 🎯 特徴

- ✅ **エピソード一覧表示** - カード形式で美しく表示
- ✅ **音声再生機能** - 再生/停止、プログレスバー、音量調整
- ✅ **バックグラウンド再生** - Service Workerによる制御
- ✅ **メディアセッション連携** - ロック画面での再生コントロール
- ✅ **PWA対応** - ホーム画面への追加、オフライン対応
- ✅ **プッシュ通知機能** - 新規エピソード公開時の通知
- ✅ **いいね機能** - エピソードにいいねを付ける
- ✅ **コメント機能** - エピソードにコメントを投稿
- ✅ **メール通知** - コメント送信時にメール通知
- ✅ **レスポンシブデザイン** - モバイルとデスクトップ対応

## 🎨 デザイン

- **Wall Street Journal風** - ミニマルでモダンなニュースサイトデザイン
- **Orbitron フォント** - 縦長のモダンなフォントで「Radio」タイトル
- **ピクセルアートアイコン** - クールでモダンな人物アイコン
- **レトロ音楽テーマ** - カラフルな「BEAT IN THE OMOYA」カバー画像

## 🚀 デモ

[ライブデモ](https://yourusername.github.io/radio-app) - GitHub Pagesで公開

## 📱 使用方法

### 基本操作
- エピソードカードをクリックして再生
- プレイボタンで再生/一時停止
- プログレスバーをクリックしてシーク
- 音量スライダーで音量調整
- 再生速度ボタンで0.5x〜2xの速度変更

### キーボードショートカット
- スペースキー: 再生/一時停止
- 左右矢印キー: 10秒シーク
- Mキー: ミュート切り替え
- 1, 2, 3キー: 再生速度切り替え

### PWAとしての使用
1. ブラウザでアプリにアクセス
2. アドレスバーの「インストール」ボタンをクリック
3. ホーム画面にアプリが追加される
4. アプリとして起動可能

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Service Worker, Web App Manifest
- **ホスティング**: GitHub Pages
- **フォント**: Inter, Orbitron
- **アイコン**: ピクセルアート風SVG
- **カバー画像**: レトロ音楽テーマ

## 📁 ファイル構成

```
radio-app/
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート
├── app.js                  # JavaScriptファイル
├── sw.js                   # Service Worker
├── manifest.json           # PWAマニフェスト
├── episodes.json           # エピソード情報
├── robots.txt              # 検索エンジン拒否
├── icons/                  # アイコンファイル
│   └── generate-icons.html # アイコン生成ツール
├── covers/                 # カバー画像
│   └── generate-covers.html # カバー画像生成ツール
├── audio/                  # 音声ファイル（要追加）
├── original-images/        # 元画像
│   ├── icon-original.png   # ピクセルアート人物画像
│   └── cover-original.png  # レトロ音楽テーマ画像
└── README.md              # このファイル
```

## 🚀 セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/radio-app.git
cd radio-app
```

### 2. 音声ファイルの追加
`audio/` フォルダに音声ファイルを配置：
- `episode-001.mp3`
- `episode-002.mp3`
- `episode-003.mp3`

### 3. アイコンファイルの生成
1. `icons/generate-icons.html` をブラウザで開く
2. ピクセルアート画像を選択
3. 各サイズのアイコンをダウンロード
4. `icons/` フォルダに配置

### 4. カバー画像の生成
1. `covers/generate-covers.html` をブラウザで開く
2. レトロ音楽テーマ画像を選択
3. 各サイズのカバー画像をダウンロード
4. `covers/` フォルダに配置

### 5. GitHub Pagesで公開
1. リポジトリのSettings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. 数分後に `https://yourusername.github.io/radio-app` でアクセス可能

## 📖 詳細ガイド

詳細なセットアップ手順は [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) を参照してください。

## 🎵 エピソードの追加

`episodes.json` を編集してエピソードを追加：

```json
{
  "id": "episode-004",
  "title": "新しいエピソード",
  "description": "エピソードの説明",
  "audioUrl": "https://yourusername.github.io/radio-app/audio/episode-004.mp3",
  "coverImage": "https://yourusername.github.io/radio-app/covers/cover-400x400.png",
  "duration": "20:00",
  "publishedAt": "2024-01-30T10:00:00Z",
  "tags": ["タグ1", "タグ2"],
  "likes": 0,
  "comments": []
}
```

## 🔧 カスタマイズ

### デザインの変更
- `styles.css` で色やレイアウトを変更
- `index.html` でHTML構造を変更

### 機能の追加
- `app.js` で新しい機能を実装
- `sw.js` でService Workerを拡張

### 設定の変更
- `manifest.json` でPWA設定を変更
- `episodes.json` でエピソード情報を管理

## 📱 ブラウザサポート

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

- GitHub Issuesで問題を報告
- コミュニティフォーラムで質問
- ドキュメントを参照

## 🎉 更新履歴

- v1.0.0 - 初期リリース（基本プレイヤー機能）
- v1.1.0 - いいね機能とコメント機能を追加
- v1.2.0 - メール通知機能を追加
- v1.3.0 - Wall Street Journal風デザインに更新

---

**Radioアプリ** - 高品質な音声コンテンツをお楽しみください 🎧
