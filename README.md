# React Hight Performance Todo

- [About](#About)
- [Webpack](#Webpack)
  - [ブラウザ Cache について](#ブラウザ-Cache-について)
  - [Code Splitting について](#Code-Splitting-について)
  - [Size](#Size)
- [React](#React)
  - [React Performance](#React-Performance)
- [App Shell](#App-Shell)
- [Web Performance](#Web-Performance)
- [Service Worker](#Service-Worker)



# About  
- React または SPA 開発に役立つ Webpack の設定や、Performance 改善の方法を調べた
- 少しずつ実装していき、ベストな方法を探っていきたい
- このリポジトリーでは React と TypeScript を使って開発している
- 基本的には Babel と Webpack を使って環境を構築している  

# Webpack  

## Code Splitting について  

#### なぜコードを分割するのか
コードを分割することで、初期表示を早くすることができる。ユーザーがアクセスした時に、ブラウザはHTML・CSS・JSを読み込みます。この時HTMLは最初に読み込まれ、styleがない状態で表示された後、CSSでスタイリングされ、JSが動き始めます。SPAのようなJSに頼り切ったサイトでは、JS(ReactやVue)はとてもサイズが大きいため、読み込みに時間がかかります。さらに、他にもpackageを使っていればさらに読み込みは遅くなります。そのためコードを分割して必要な時にファイルを読み込むようにすることで、初期表示を早くすることができる。  
  
**参考**  
ちゃんと理解するCode Splitting - Qiita ... https://qiita.com/seya/items/06b160adb7801ae9e66f  

### よくない方法
Webpackの機能を使ってコード分割を行う。一番簡単な方法として、`entry`に複数のファイルを書いて分割する方法を思いつくかもしれないが、この方法だと、`entry`ファイルのそれぞれにmoduleがバンドルされてしまう。例えば、`index.js`と`another.js`が存在し、`another.js`で`lodash`を使っているが、`index.js`では使っていない状況を考える。この場合、`webpack`を使って`build`すると、`index.js`と`another.js`の両方に`module`がバンドルされてしまう。こうなってしまうとコードを分割してもコード量が増えてしまい、逆にオーバーヘッドになってしまう。これを避けるには`SplitChunksPlugin`を使う必要がある。

### コードの重複を防ぐ
コードの重複を防ぐには、`optimization.splitChunks.chunks`を`all`に設定する。

### ダイナミックインポート
ダイナミックインポートを使うことで、特定のファイルにbuild時の設定を組み込むことができたり、指定したmoduleを分割することができる。

**参考**  
Code Splitting - Webpack ... https://webpack.js.org/guides/code-splitting/  
Code Splitting - React ... https://ja.reactjs.org/docs/code-splitting.html  
Code Splitting - create-react-app ... https://create-react-app.dev/docs/code-splitting/  


## Cache  

### ブラウザ Cache について  
`webpack`で`output.filename`を`main.js`のように指定していると、ファイルの変更を検知できないため、キャッシュがうまく機能しない。
ブラウザーは初期読み込み時に静的ファイルをキャッシュに保存するが、その時にファイル名を見て更新されたかどうかを判断している。そのため、ファイル名が変更されていないとファイルを更新しても、表示が変わらないということがよくある。そのため`webpack`では`[name].[contenthash].js`のようにすることで、ファイルの変更のたびにファイル名が変更されるように設定できるようになっている。  
  
参考: https://webpack.js.org/guides/caching/  

### strategy

#### optimization.runtimeChunk

runtimeメインのコードから分けるために使用される。`single`を設定すると、runtimeが一つのfileにまとめられる。  

#### optimization.cacheGroups.vendor

`vendor`を設定すると、特定のmoduleのコードを分割することができる。更新頻度の少ないmoduleを分割することで、キャッシュを効率的に行うことができ、requestの回数を減らすことができる。例えば、`node_modules`は頻繁に更新される`module`ではないので、`node_modules`を分割することで効率的にキャッシュを行うことができる。

```json
  {
    "optimization": {
      "runtimeChunk": "single",
      "cacheGroup": {
        "vendor": {
          "test": /[\\/]node_modules[\\/]/,
          "name": "vendors",
          "chunks": "all"
        }
      }
    }
  }
```

**参照**
Cache - Webpack ... https://webpack.js.org/guides/caching/  

## Bundle Size の調査
webpackを使用した場合、JavaScriptがbundleされるために、1ファイルのサイズがとても大きくなってしまうことがある。そうなってしまうと、初期読み込みが遅くなってしまい、UXの低下をもたらす。この問題を解決するために有効な手段として使うのが[Performance Budgets](#Performance-Budgets)である。これを指標として、パフォーマンス改善を行っていく。
webpackには `webpack-bundle-analyzer` という Bundle Size を可視化するためのツールがあり、それを使うとスムーズ。カーソルを当てると、フィルサイズなどが表示されるので一つずつ改善していく。改善の仕方は、なぜそのファイルが重いのか、どのような用途で使われているかを調査する。その後、別ライブラリーで置き換えたり、自前で実装したりして、改善していく。

**参考**
- webpackのbundle後のJavaScriptのサイズを減らしている話 - リクルート ... https://recruit-tech.co.jp/blog/2018/12/15/try_optimization_webpack_bundle_size/  

# Performance

## クリティカルレンダリングパス
- クリティカルレンダリングパスとは、HTML、CSS、 JavaScriptのバイトの受信から、これらをピクセルとしてレンダリングするために必要な処理までの中間段階で行われている内容を理解してパフォーマンスの最適化を行うこと
- クリティカルレンダリングパスの最適化は、現在のユーザー操作に関連するコンテンツ表示の優先順位付けを意味する

## レンダリング
- アニメーションがスムーズに見えるのは１秒間に60回リフレッシュ(60fps)する時である
- 60fpsを保つために全てのタスクは10ms以内に完了する必要がある
- タスクを実行すると、JS -> Style(CSSがどの要素にマッチするか) -> Layout(幅や高さ、位置などを計算して適用。子のStyleにも影響する) -> Paint(色や影、線などの描画が行われる) -> Composite(要素の重なりを計算する) の順でレンダリングが実行される
- Layoutが最も重い処理となり、次にPaintが重い。高頻度でStyleが変更される場合、Compositeで処理される`transform`と`opacity`に絞った方が良い。
- [css trigger](https://csstriggers.com)を見ると、どの要素がどこで適用されるのかわかる

**参考**  
- レンダリング パフォーマンス - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering?hl=ja
- コンポジット - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count?hl=ja

## JavaScript パフォーマンス
- タイミングの悪いスクリプトや長時間実行されるスクリプトはパフォーマンス低下の原因になる
- フレームがずれて実行される可能性があるため`setTimeout`や`setInterval`を使用するのを避けて`requestAnimationFrame`を使用するようにする
- スクロール操作のようなアニメーションでは、JavaScript の実行時間を 3～4 ミリ秒に抑えることが理想的
- DOM操作を必要としない検索やソートなどのデータ操作またはトラバーサルといった長時間実行されるスクリプトは`Web Worker`に移動する
- マイクロタスクを使用して、複数のフレームに渡ってDOMを変更する
- Chrome DevToolsのTimelineとJavaScriptプロファイラを使用して、JavaScriptの影響を評価する
- 細かい最適化として、**要素の offsetTop の要求は getBoundingClientRect() の計算よりも高速**というものもあるが、ゲームなどの高度な処理が必要でない限りこの最適化は拘らなくても良い(新規で作る場合は意識してもよさそう)

**参考**  
- JavaScript 実行の最適化 - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering/optimize-javascript-execution?hl=ja

## RAILモデル
RAILモデルはユーザーを中心に考えるパフォーマンスモデルである。全てのウェブアプリのライフサイクルには Response・ Animation・Idle・Load の4つの側面があり、これらに適したパフォーマンスはそれぞれ異なる。  
  
**ユーザーを第一に考えます。最終目標は、特定の端末でのサイトの処理速度をあげることではありません。ユーザーが満足感を得ることが最終目標です。**  
  
**ユーザーに対して即座に応答します。ユーザー入力は100ミリ秒以内に認識します。**  
- ユーザーがサイトに費やす時間の大半が、サイトの読み込みを待つ時間ではなく、サイトを使用しながらレスポンスを待つ時間になるようにする。
- 0 ~ 100 ミリ秒 ... ユーザーはすぐに結果を得られたと感じる。
- 100 ~ 300 ミリ秒 ... やや遅いと感じる。
- 300 ~ 1,000 ミリ秒 ... 途切れることなく自然にタスク(読み込みや遷移)が進んでいると感じられる。
- 1,000 ミリ秒以上 ... 実行したタスクへの関心を失う
- 10,000 ミリ秒以上 ... タスクを中断し、そのまま戻ってこない可能性がある
- 500ミリ秒以上かかる場合はフィードバックを提供する必要

**アニメーションやスクロールでは、10ミリ秒以内にフレームを生成します。**  
- アニメーションは60fpsを目指す必要があるが、ブラウザが新しいフレームを画面に描画する必要があることを考えると、アニメーションをコードで実行できる時間は10ミリ秒程度であるため、必要最小限の処理に留める必要がある。
- 負荷の高い処理を100ミリ秒に収まるように事前に実行しておき、60fpsに収まるように工夫するのも良い

**メインスレッドのアイドル時間を最大限に活用します。**  
- データのプリロードを最小限に抑えて、アプリの読み込みを高速にし、残っているデータはアイドル時間に読み込むようにする
- 遅延している作業は50ミリ秒程度のブロックにグループ化する
- ユーザーが操作を始めた場合はレスポンスを返すことを優先する
- 100ミリ秒以内にレスポンスを返すためには、アプリで毎回50ミリ秒以内にメインスレッドに制御を返す必要がある

**ユーザーの作業を妨げません。インタラクティブ コンテンツは1000ミリ秒以内に提供します**
- サイトは1秒以内に読み込まれたと感じられなければ、ユーザーの集中力がきれ、タスクの操作に失敗したと感じる
- 読み込みが終わったと感じられれば良いため、優先度順に読み込み、レスポンスを返せば良い

**参考**  
- RAIL モデルでパフォーマンスを測定する - Google Web Fundamentals... https://developers.google.com/web/fundamentals/performance/rail?hl=ja

## Performance Budgets [WIP]

# React [WIP]  

## React Performance  

Reactでのパフォーマンス改善の鍵は、無駄な再レンダリングを抑えることと、サイズを最小限に抑えることだと考える。無駄な再レンダリングを抑える必要があるのは、JavaScriptはシングルスレッドで動作する言語であるため、一つの処理がメインスレッドを占有してしまうと、他の処理が動作しなくなってしまう。つまり、再レンダリングによって無駄なスクリプトが走ることですぐに実行したいスクリプトの実行が遅れてしまうのである。サイズを抑える必要があるのは、JavaScriptをブラウザにできるだけ早く読み込んでもらい、できるだけ早く実行するためである。

### List
Reactではリスト形式のUIを差分レンダリングしているため、アイテムにkey要素を指定しないと、アイテムが追加されるたびに再レンダリングされてしまったり、うまく動作しないことがある。また、key要素にrandomな値やindexを指定してもうまく動作しなかったり、リスト全体が再レンダリングされてしまい、パフォーマンスの低下をもたらすので、各アイテムに固有の一意なIDをつける必要がある。さらにリスト形式のUIの場合でデータ量が多い場合、際レンダリングにかなりのコストが生じるので、`shouldComponentUpdate`や`memo`、`PureComponent`などを使って、再レンダリングを抑制する必要がある。

### コンポーネントを細かく分ける
Reactでは再レンダリングを抑制するための手段が各コンポーネントに対して1つしかない(1つのコンポーネントに対して`memo`や`PureComponent`を使えるのは1つ)。そのため、あるコンポーネントに高頻度で変更されるデータを保持していてFatなコンポーネントである場合、無駄な要素まで再レンダリングされる可能性がある。そうならないためにも、できるだけ小さい単位でコンポーネントを分割して、再レンダリングを抑制する必要がある。

### 表示されていない領域のDOMを生成しないようにする
何も工夫をせずにリスト形式のUIを実装した場合、実際に画面には写っていない部分もレンダリングされてしまい、処理が無駄になってしまう。そのため見えている部分のみ画面に表示して、無駄な処理を減らす必要がある。`react-virtualized`が有名だが、`react-window`の方が軽量でよさそう。`react-vertualized`のGitHubにも`react-window`の方が軽いと書かれている。

### パフォーマンスの測定
- Chrome Dev Tools ... Performanceパネルでレンダリング測定・NetworkパネルでAPIとの接続測定
- React Dev Tools ... Highlight Update を使って差分レンダリングの確認
- @welldone-software/why-did-you-render ... 再レンダリングしている箇所とその理由、無駄に再生成されているデータを教えてくれる

**参考**  
- パフォーマンス最適化 - React ... https://ja.reactjs.org/docs/optimizing-performance.html
- お前らのReactは遅い - Qiita ... https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f
- React製のSPAのパフォーマンスチューニング実例 - リクルート ... https://recruit-tech.co.jp/blog/2018/09/19/react_spa_performance_tuning/  

# App Shell [WIP]  
- App Shell モデル - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/architecture/app-shell?hl=ja
- Next.js ... https://nextjs.org/docs/getting-started

# Web Performance [WIP]  
- パフォーマンスが重要なのはなぜか - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/why-performance-matters?hl=ja
- RAIL モデルでパフォーマンスを計測する - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rail?hl=ja
- Loading Performance - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/get-started?hl=ja
- レンダリング パフォーマンス - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering?hl=ja  

# Service Worker [WIP]  
- Service Worker について - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja  
