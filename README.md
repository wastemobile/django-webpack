# Django work with Webpack

讓 Django 搭配 webpack 處理前端視覺開發流程，目前加上了 PostCSS 與 Tailwind，但因為基礎架構設置好了，要使用 Bulma 或任何前端視覺框架都很方便，目前聚焦使用 Tailwind。

試用過 [django-tailwind](https://github.com/timonweb/django-tailwind) 的流程，以及 [django-bulma](https://github.com/timonweb/django-bulma) 使用 template tags 處理的 bulma form 樣式，兩者其實都是以 Django command 驅動 npm script 的模式在後面運作。

發現 django-webpack-loader 套件之後，終於摸了一下大名鼎鼎的 Webpack，驚為天人，除了能一統前端設計的流程外，未來還可搭配 Vue 添加前端互動功能。

- Django 套件：[django-webpack-loader](https://github.com/owais/django-webpack-loader)
- NPM 套件：[webpack-bundle-tracker](https://github.com/owais/webpack-bundle-tracker)

## 使用方式

> 在 macOS Catalina 環境，已設置 pyenv（選項）、安裝了 pipenv。

1. `git clone https://github.com/wastemobile/django-webpack.git myproject`
2. 進入目錄 `cd myproject`，刪除原有 git 環境 `rm -rf .git`，再重新設置 git
3. 執行 `npm install` 安裝套件（npm）
4. 安裝虛擬環境 `pipenv --python 3.6.9`（依個人環境需求設置）
5. 安裝必要套件： `pipenv install django django-webpack-loader`
6. 進入虛擬環境 `pipenv shell`
7. 安裝 Django 專案： `django-admin startproject config .`
8. 修改 `config/settings.py`（見下方說明）
9. 自行建立 Django apps、設置 urls 等等
9. 自行修改替換 tailwind.config.js 中的設計需求設置，修改樣式 `frontend/style.scss`
10. 執行 `npm run build` 產生開發環境使用的樣式檔
11. 執行 `python manage.py runserver` 、開發 Django 應用
12. 部署前：
	1. 修改 `config/settings.py`（DEBUG = False）
	2. 執行 `npm run deploy` 產生正式環境使用的樣式檔（已簡化、壓縮、purge）
	3. 集結靜態檔案 `python manage.py collectstatic`
13. 部署到正式環境

## Settings.py 修改內容

```
INSTALLED_APPS = [
    ...
    'webpack_loader',
]

TEMPLATES = [
    {
      ...
      'DIRS': [os.path.join(BASE_DIR, 'templates')], // (1.)
      ...
    },
]

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'assets'), // (2.)
]

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'bundles/', // (3.)
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json'), //(4.)
    }
}

if not DEBUG:
    WEBPACK_LOADER['DEFAULT'].update({
        'BUNDLE_DIR_NAME': 'dist/', // (5.)
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats-prod.json'), // (6.)
    })
```

1. Django 預設是去每個應用目錄下找模版，但我覺得設置集中的 `templates` 目錄更方便，只要記得下面的次目錄還是要遵循 Django 預設架構。
2. 我覺得 Django 靜態資源的幾個設置，最理想的設置法應該是：
    - URL = '/static/'
    - ROOT = 'public'
    - DIRS = 'assets'
3. 平時開發執行 `npm run build`，是將彙整後的樣式與 JS 擺放到 `assets/bundles/` 目錄下，未壓縮、簡化，比較好檢查錯誤。
4. 透過 webpack-bundle-tracker，會替每項彙整後的資源打上「檔名 hash」、讓瀏覽器能每次均載入最新的修正，這個唯一的檔名就必須要能讓 Django 知道，所以會產生一個 webpack-stats.json 檔案。
5. 正式部署前執行 `npm run deploy` 會將彙整後檔案改放到 `assets/dist/` 目錄，這時的檔案已經簡化、壓縮、甚至還經過了 PurgeCSS 的處理。（**記得要先去修改 `settings.py` 中的 DEBUG 設定！**）
6. 紀錄正式彙整後 stats 的檔名加上 prod 字樣。

## Django 模版使用

- 頂端引入 `{% load render_bundle from webpack_loader %}`
- 擺放樣式 `{% render_bundle 'main' 'css' %}`
- 擺放程式 `{% render_bundle 'main' 'js' %}`

一般來說，這些東西寫進 `base.html` 基礎排版檔後就不用再管了。

進階用法可以設置多個 webpack projects 分別引入，請參考 [官方解說](https://github.com/owais/django-webpack-loader#multiple-webpack-projects) 自行修改。

## 目錄設定

正常狀態，會將 Django 靜態資源的 URL 設置為 `/static/`、本地集結的目錄為 `static`，然後開發時的目錄為 `assets`。流程很簡單：執行 `python manage.py collectstatic` 會將 assets 目錄下的東西都搬到 static 目錄，還會從 admin 與各應用（包含某些第三方套件）一併集結到 static。

另外替 Webpack 設置工作目錄 `frontend`，開發原始檔案擺在其中，平時開發時會將結果輸出到 `assets/bundles/` 目錄；部署到正式環境前則改放到 `assets/dist/`，兩者的差別在最後結果有沒有簡化、壓縮，以及套用 PurgeCSS。

根目錄下會有 `webpack.base.js`、`webpack.dev.js` 與 `webpack.prod.js` 三個設定檔，預先安裝了 webpack-merge 套件，package.json 中寫了兩個 scripts：

- "build": "webpack --config webpack.dev.js"
- "deploy": "webpack --config webpack.prod.js"

平常開發時修改樣式後，執行 `npm run build`；正式部署前，先修改 `settings.py` 中的設定、接著執行 `npm run deploy`，然後集結靜態檔案 `python manage.py collectstatic`，commit 後就可以部署了。

## 參考教學

[Using Webpack transparently with Django + hot reloading React components as a bonus](https://owais.lone.pw/blog/webpack-plus-reactjs-and-django/) - 讓 Django 搭配 Webpack 使用，還能獲得動態載入 React 元件的紅利。

結論：**webpack-bundle-tracker + django-webpack-loader**。

