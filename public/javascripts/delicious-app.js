import '../sass/style.scss'

// Bling, provides JQuerry like selectors and .on (addEventListener) function
import { $, $$ } from './modules/bling'
import autocomplete from './modules/autocomplete'

// Selecting address, lat and lng IDs in _storeForm.pug
autocomplete($('#address'), $('#lat'), $('#lng'))
