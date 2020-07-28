import * as React from 'react';

import { SVGIcon, StandardProps } from '../@types/common';

export type IconNames =
  | '500px'
  | 'address-book'
  | 'address-book-o'
  | 'adjust'
  | 'adn'
  | 'align-center'
  | 'align-justify'
  | 'align-left'
  | 'align-right'
  | 'alipay'
  | 'amazon'
  | 'ambulance'
  | 'anchor'
  | 'android'
  | 'android2'
  | 'angellist'
  | 'angle-double-down'
  | 'angle-double-left'
  | 'angle-double-right'
  | 'angle-double-up'
  | 'angle-down'
  | 'angle-left'
  | 'angle-right'
  | 'angle-up'
  | 'apple'
  | 'archive'
  | 'area-chart'
  | 'arrow-circle-down'
  | 'arrow-circle-left'
  | 'arrow-circle-o-down'
  | 'arrow-circle-o-left'
  | 'arrow-circle-o-right'
  | 'arrow-circle-o-up'
  | 'arrow-circle-right'
  | 'arrow-circle-up'
  | 'arrow-down'
  | 'arrow-down-line'
  | 'arrow-down2'
  | 'arrow-left'
  | 'arrow-left-line'
  | 'arrow-right'
  | 'arrow-right-line'
  | 'arrow-up'
  | 'arrow-up-line'
  | 'arrow-up2'
  | 'arrows'
  | 'arrows-alt'
  | 'arrows-h'
  | 'arrows-v'
  | 'asl-interpreting'
  | 'assistive-listening-systems'
  | 'asterisk'
  | 'at'
  | 'attachment'
  | 'attribution'
  | 'audio-description'
  | 'avatar'
  | 'back-arrow'
  | 'backward'
  | 'balance-scale'
  | 'ban'
  | 'bandcamp'
  | 'bank'
  | 'bar-chart'
  | 'bar-chart-ranking'
  | 'barcode'
  | 'bars'
  | 'battery'
  | 'battery-0'
  | 'battery-1'
  | 'battery-2'
  | 'battery-3'
  | 'bed'
  | 'beer'
  | 'behance'
  | 'behance-square'
  | 'bell'
  | 'bell-o'
  | 'bell-slash'
  | 'bell-slash-o'
  | 'bicycle'
  | 'binoculars'
  | 'birthday-cake'
  | 'bitbucket'
  | 'bitbucket-square'
  | 'black-tie'
  | 'blind'
  | 'bluetooth'
  | 'bluetooth-b'
  | 'bold'
  | 'bolt'
  | 'bomb'
  | 'book'
  | 'book2'
  | 'bookmark'
  | 'bookmark-o'
  | 'braille'
  | 'briefcase'
  | 'btc'
  | 'btn-off'
  | 'btn-on'
  | 'bug'
  | 'building'
  | 'building-o'
  | 'building2'
  | 'bullhorn'
  | 'bullseye'
  | 'bus'
  | 'buysellads'
  | 'cab'
  | 'calculator'
  | 'calendar'
  | 'calendar-check-o'
  | 'calendar-minus-o'
  | 'calendar-o'
  | 'calendar-plus-o'
  | 'calendar-times-o'
  | 'camera'
  | 'camera-retro'
  | 'car'
  | 'caret-down'
  | 'caret-left'
  | 'caret-right'
  | 'caret-up'
  | 'cart-arrow-down'
  | 'cart-plus'
  | 'cc'
  | 'cc-amex'
  | 'cc-diners-club'
  | 'cc-discover'
  | 'cc-jcb'
  | 'cc-mastercard'
  | 'cc-paypal'
  | 'cc-stripe'
  | 'cc-visa'
  | 'certificate'
  | 'character-area'
  | 'character-authorize'
  | 'charts'
  | 'charts-line'
  | 'check'
  | 'check-circle'
  | 'check-circle-o'
  | 'check-square'
  | 'check-square-o'
  | 'check2'
  | 'chevron-circle-down'
  | 'chevron-circle-left'
  | 'chevron-circle-right'
  | 'chevron-circle-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'child'
  | 'chrome'
  | 'circle'
  | 'circle-o'
  | 'circle-o-notch'
  | 'circle-thin'
  | 'clock-o'
  | 'clone'
  | 'close'
  | 'close-circle'
  | 'cloud'
  | 'cloud-download'
  | 'cloud-upload'
  | 'cny'
  | 'code'
  | 'code-fork'
  | 'codepen'
  | 'codiepie'
  | 'coffee'
  | 'cog'
  | 'cogs'
  | 'coincide'
  | 'collasped'
  | 'collasped-o'
  | 'columns'
  | 'comment'
  | 'comment-o'
  | 'commenting'
  | 'commenting-o'
  | 'comments'
  | 'comments-o'
  | 'compass'
  | 'compress'
  | 'connectdevelop'
  | 'contao'
  | 'copy'
  | 'copy-o'
  | 'copyright'
  | 'creative'
  | 'creative-commons'
  | 'credit-card'
  | 'credit-card-alt'
  | 'crop'
  | 'crosshairs'
  | 'css3'
  | 'cube'
  | 'cubes'
  | 'cut'
  | 'cutlery'
  | 'dashboard'
  | 'dashcube'
  | 'data-authorize'
  | 'data-decrease'
  | 'data-increase'
  | 'database'
  | 'deaf'
  | 'dedent'
  | 'delicious'
  | 'desktop'
  | 'detail'
  | 'deviantart'
  | 'diamond'
  | 'digg'
  | 'dot-circle-o'
  | 'down'
  | 'download'
  | 'download2'
  | 'dribbble'
  | 'dropbox'
  | 'drupal'
  | 'edge'
  | 'edit'
  | 'edit2'
  | 'eercast'
  | 'eject'
  | 'ellipsis-h'
  | 'ellipsis-v'
  | 'envelope'
  | 'envelope-o'
  | 'envelope-open'
  | 'envelope-open-o'
  | 'envelope-square'
  | 'envira'
  | 'eraser'
  | 'etsy'
  | 'eur'
  | 'exchange'
  | 'exclamation'
  | 'exclamation-circle'
  | 'exclamation-circle2'
  | 'exclamation-triangle'
  | 'exit'
  | 'expand'
  | 'expand-o'
  | 'expeditedssl'
  | 'explore'
  | 'export'
  | 'external-link'
  | 'external-link-square'
  | 'eye'
  | 'eye-slash'
  | 'eyedropper'
  | 'fa'
  | 'facebook'
  | 'facebook-official'
  | 'facebook-square'
  | 'fast-backward'
  | 'fast-forward'
  | 'fax'
  | 'female'
  | 'fighter-jet'
  | 'file'
  | 'file-audio-o'
  | 'file-code-o'
  | 'file-download'
  | 'file-excel-o'
  | 'file-image-o'
  | 'file-movie-o'
  | 'file-o'
  | 'file-pdf-o'
  | 'file-powerpoint-o'
  | 'file-text'
  | 'file-text-o'
  | 'file-upload'
  | 'file-word-o'
  | 'file-zip-o'
  | 'film'
  | 'filter'
  | 'fire'
  | 'fire-extinguisher'
  | 'firefox'
  | 'first-order'
  | 'flag'
  | 'flag-checkered'
  | 'flag-o'
  | 'flask'
  | 'flickr'
  | 'flow'
  | 'folder'
  | 'folder-o'
  | 'folder-open'
  | 'folder-open-o'
  | 'font'
  | 'fonticons'
  | 'fort-awesome'
  | 'forumbee'
  | 'forward'
  | 'foursquare'
  | 'frame'
  | 'free-code-camp'
  | 'frown-o'
  | 'futbol-o'
  | 'gamepad'
  | 'gavel'
  | 'gbp'
  | 'ge'
  | 'gear'
  | 'gear-circle'
  | 'gear2'
  | 'gears2'
  | 'genderless'
  | 'get-pocket'
  | 'gg'
  | 'gg-circle'
  | 'gift'
  | 'git'
  | 'git-square'
  | 'github'
  | 'github-alt'
  | 'github-square'
  | 'gitlab'
  | 'gittip'
  | 'glass'
  | 'glide'
  | 'glide-g'
  | 'globe'
  | 'globe2'
  | 'good'
  | 'google'
  | 'google-plus'
  | 'google-plus-circle'
  | 'google-plus-square'
  | 'google-wallet'
  | 'grav'
  | 'group'
  | 'h-square'
  | 'hand-grab-o'
  | 'hand-lizard-o'
  | 'hand-o-down'
  | 'hand-o-left'
  | 'hand-o-right'
  | 'hand-o-up'
  | 'hand-peace-o'
  | 'hand-pointer-o'
  | 'hand-scissors-o'
  | 'hand-spock-o'
  | 'hand-stop-o'
  | 'handshake-o'
  | 'hashtag'
  | 'hdd-o'
  | 'header'
  | 'headphones'
  | 'heart'
  | 'heart-o'
  | 'heartbeat'
  | 'help-o'
  | 'history'
  | 'home'
  | 'hospital-o'
  | 'hourglass'
  | 'hourglass-1'
  | 'hourglass-2'
  | 'hourglass-3'
  | 'hourglass-o'
  | 'houzz'
  | 'html5'
  | 'i-cursor'
  | 'id-badge'
  | 'id-card'
  | 'id-card-o'
  | 'id-info'
  | 'id-mapping'
  | 'ils'
  | 'image'
  | 'imdb'
  | 'import'
  | 'inbox'
  | 'indent'
  | 'industry'
  | 'info'
  | 'info-circle'
  | 'inr'
  | 'instagram'
  | 'internet-explorer'
  | 'intersex'
  | 'ios'
  | 'ioxhost'
  | 'italic'
  | 'joomla'
  | 'jsfiddle'
  | 'key'
  | 'keyboard-o'
  | 'krw'
  | 'language'
  | 'laptop'
  | 'lastfm'
  | 'lastfm-square'
  | 'leaf'
  | 'leanpub'
  | 'left'
  | 'lemon-o'
  | 'level-down'
  | 'level-up'
  | 'lightbulb-o'
  | 'line-chart'
  | 'link'
  | 'linkedin'
  | 'linkedin-square'
  | 'linode'
  | 'linux'
  | 'list'
  | 'list-alt'
  | 'list-ol'
  | 'list-ul'
  | 'location-arrow'
  | 'lock'
  | 'logo-ads'
  | 'logo-analytics'
  | 'logo-dmp'
  | 'logo-mobile'
  | 'logo-shop'
  | 'logo-survey'
  | 'logo-video'
  | 'long-arrow-down'
  | 'long-arrow-left'
  | 'long-arrow-right'
  | 'long-arrow-up'
  | 'low-vision'
  | 'magic'
  | 'magic2'
  | 'magnet'
  | 'male'
  | 'map'
  | 'map-marker'
  | 'map-o'
  | 'map-pin'
  | 'map-signs'
  | 'mars'
  | 'mars-double'
  | 'mars-stroke'
  | 'mars-stroke-h'
  | 'mars-stroke-v'
  | 'maxcdn'
  | 'meanpath'
  | 'medium'
  | 'medkit'
  | 'meetup'
  | 'meh-o'
  | 'mercury'
  | 'microchip'
  | 'microphone'
  | 'microphone-slash'
  | 'minus'
  | 'minus-circle'
  | 'minus-square'
  | 'minus-square-o'
  | 'mixcloud'
  | 'mobile'
  | 'modx'
  | 'money'
  | 'moon-o'
  | 'more'
  | 'mortar-board'
  | 'motorcycle'
  | 'mouse-pointer'
  | 'multiple-lines-chart'
  | 'music'
  | 'neuter'
  | 'newspaper-o'
  | 'object-group'
  | 'object-ungroup'
  | 'odnoklassniki'
  | 'odnoklassniki-square'
  | 'off'
  | 'ok-circle'
  | 'opencart'
  | 'openid'
  | 'opera'
  | 'optin-monster'
  | 'order-form'
  | 'page-end'
  | 'page-next'
  | 'page-previous'
  | 'page-top'
  | 'pagelines'
  | 'paint-brush'
  | 'paperclip'
  | 'paragraph'
  | 'paste'
  | 'pause'
  | 'pause-circle'
  | 'pause-circle-o'
  | 'paw'
  | 'paypal'
  | 'pc'
  | 'pencil'
  | 'pencil-square'
  | 'people-group'
  | 'peoples'
  | 'peoples-map'
  | 'percent'
  | 'phone'
  | 'phone-square'
  | 'pie-chart'
  | 'pied-piper'
  | 'pied-piper-alt'
  | 'pied-piper-pp'
  | 'pinterest'
  | 'pinterest-p'
  | 'pinterest-square'
  | 'plane'
  | 'play'
  | 'play-circle'
  | 'play-circle-o'
  | 'play2'
  | 'plug'
  | 'plus'
  | 'plus-circle'
  | 'plus-square'
  | 'plus-square-o'
  | 'podcast'
  | 'power-off'
  | 'print'
  | 'product-hunt'
  | 'profile'
  | 'project'
  | 'public-opinion'
  | 'puzzle-piece'
  | 'qq'
  | 'qrcode'
  | 'question'
  | 'question-circle'
  | 'question-circle2'
  | 'question2'
  | 'quora'
  | 'quote-left'
  | 'quote-right'
  | 'ra'
  | 'random'
  | 'rate'
  | 'ravelry'
  | 'realtime'
  | 'recycle'
  | 'reddit'
  | 'reddit-alien'
  | 'reddit-square'
  | 'refresh'
  | 'refresh2'
  | 'registered'
  | 'related-map'
  | 'reload'
  | 'remind'
  | 'renren'
  | 'repeat'
  | 'reply'
  | 'reply-all'
  | 'retention'
  | 'retweet'
  | 'right'
  | 'road'
  | 'rocket'
  | 'rss'
  | 'rss-square'
  | 'rub'
  | 's15'
  | 'safari'
  | 'sales'
  | 'growth'
  | 'save'
  | 'scribd'
  | 'search'
  | 'search-minus'
  | 'search-peoples'
  | 'search-plus'
  | 'sellsy'
  | 'send'
  | 'send-o'
  | 'sequence'
  | 'sequence-down'
  | 'sequence-up'
  | 'server'
  | 'setting'
  | 'shapes'
  | 'share'
  | 'share-alt'
  | 'share-alt-square'
  | 'share-square'
  | 'share-square-o'
  | 'share2'
  | 'shield'
  | 'ship'
  | 'shirtsinbulk'
  | 'shopping-bag'
  | 'shopping-basket'
  | 'shopping-cart'
  | 'shower'
  | 'sign-in'
  | 'sign-out'
  | 'signal'
  | 'signing'
  | 'simplybuilt'
  | 'sitemap'
  | 'skyatlas'
  | 'skype'
  | 'slack'
  | 'sliders'
  | 'slideshare'
  | 'smile-o'
  | 'snapchat'
  | 'snapchat-ghost'
  | 'snapchat-square'
  | 'snowflake-o'
  | 'sort'
  | 'sort-alpha-asc'
  | 'sort-alpha-desc'
  | 'sort-amount-asc'
  | 'sort-amount-desc'
  | 'sort-desc'
  | 'sort-numeric-asc'
  | 'sort-numeric-desc'
  | 'sort-up'
  | 'soundcloud'
  | 'space-shuttle'
  | 'speaker'
  | 'spinner'
  | 'spoon'
  | 'spotify'
  | 'square'
  | 'square-o'
  | 'squares'
  | 'stack-exchange'
  | 'stack-overflow'
  | 'star'
  | 'star-half'
  | 'star-half-o'
  | 'star-o'
  | 'steam'
  | 'steam-square'
  | 'step-backward'
  | 'step-forward'
  | 'stethoscope'
  | 'sticky-note'
  | 'sticky-note-o'
  | 'stop'
  | 'stop-circle'
  | 'stop-circle-o'
  | 'stop2'
  | 'street-view'
  | 'strikethrough'
  | 'stumbleupon'
  | 'stumbleupon-circle'
  | 'subscript'
  | 'subway'
  | 'suitcase'
  | 'sun-o'
  | 'superpowers'
  | 'superscript'
  | 'support'
  | 'table'
  | 'tablet'
  | 'tag'
  | 'tag-area'
  | 'tag-authorize'
  | 'tag-unauthorize'
  | 'tags'
  | 'target'
  | 'task'
  | 'tasks'
  | 'telegram'
  | 'tencent-weibo'
  | 'terminal'
  | 'terminal-line'
  | 'text-height'
  | 'text-width'
  | 'th'
  | 'th-large'
  | 'th-list'
  | 'th2'
  | 'themeisle'
  | 'thermometer'
  | 'thermometer-0'
  | 'thermometer-1'
  | 'thermometer-2'
  | 'thermometer-3'
  | 'thumb-tack'
  | 'thumbs-down'
  | 'thumbs-o-down'
  | 'thumbs-o-up'
  | 'thumbs-up'
  | 'ticket'
  | 'times-circle'
  | 'times-circle-o'
  | 'tint'
  | 'tmall'
  | 'toggle-down'
  | 'toggle-left'
  | 'toggle-off'
  | 'toggle-on'
  | 'toggle-right'
  | 'toggle-up'
  | 'trademark'
  | 'train'
  | 'transgender-alt'
  | 'trash'
  | 'trash-o'
  | 'trash2'
  | 'tree'
  | 'tree-close'
  | 'tree-open'
  | 'trello'
  | 'trend'
  | 'tripadvisor'
  | 'trophy'
  | 'truck'
  | 'try'
  | 'tty'
  | 'tumblr'
  | 'tumblr-square'
  | 'tv'
  | 'twinkle-star'
  | 'twitch'
  | 'twitter'
  | 'twitter-square'
  | 'umbrella'
  | 'underline'
  | 'undo'
  | 'universal-access'
  | 'unlink'
  | 'unlock'
  | 'unlock-alt'
  | 'up'
  | 'upload'
  | 'upload2'
  | 'usb'
  | 'usd'
  | 'user'
  | 'user-analysis'
  | 'user-circle'
  | 'user-circle-o'
  | 'user-info'
  | 'user-md'
  | 'user-o'
  | 'user-plus'
  | 'user-secret'
  | 'user-times'
  | 'vcard'
  | 'vcard-o'
  | 'venus'
  | 'venus-double'
  | 'venus-mars'
  | 'viacoin'
  | 'viadeo'
  | 'viadeo-square'
  | 'video-camera'
  | 'views-authorize'
  | 'views-unauthorize'
  | 'vimeo'
  | 'vimeo-square'
  | 'vine'
  | 'vk'
  | 'volume-control-phone'
  | 'volume-down'
  | 'volume-off'
  | 'volume-up'
  | 'warning'
  | 'weapp'
  | 'web'
  | 'wechat'
  | 'weibo'
  | 'whatsapp'
  | 'wheelchair'
  | 'wheelchair-alt'
  | 'wifi'
  | 'wikipedia-w'
  | 'window-close'
  | 'window-close-o'
  | 'window-maximize'
  | 'window-minimize'
  | 'window-restore'
  | 'windows'
  | 'wordpress'
  | 'wpbeginner'
  | 'wpexplorer'
  | 'wpforms'
  | 'wrench'
  | 'xing'
  | 'xing-square'
  | 'yahoo'
  | 'yc'
  | 'yc-square'
  | 'yelp'
  | 'yoast'
  | 'youtube'
  | 'youtube-play'
  | 'youtube-square';

export interface IconProps extends StandardProps {
  /** You can use a custom element for this component */
  componentClass?: React.ElementType;

  /** Icon name */
  icon: IconNames | SVGIcon;

  /** Sets the icon size */
  size?: 'lg' | '2x' | '3x' | '4x' | '5x';

  /** Flip the icon */
  flip?: 'horizontal' | 'vertical';

  /** Combine multiple icons */
  stack?: '1x' | '2x';

  /** Rotate the icon */
  rotate?: number;

  /** Fixed icon width because there are many icons with uneven size */
  fixedWidth?: boolean;

  /** Set SVG style when using custom SVG Icon */
  svgStyle?: React.CSSProperties;

  /** Dynamic rotation icon */

  spin?: boolean;

  /** Use pulse to have it rotate with 8 steps */
  pulse?: boolean;

  /** Inverse color */
  inverse?: boolean;
}

declare const Icon: React.ComponentType<IconProps>;

export default Icon;
