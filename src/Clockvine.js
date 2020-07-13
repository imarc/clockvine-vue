import ApiModule from './modules/ApiModule'
import ContinuousCollectionComponent from './components/ContinuousCollectionComponent'
import ElementApiModule from './modules/ElementApiModule'
import ElementComponent from './components/ElementComponent'
import CollectionComponent from './components/CollectionComponent'
import HttpQueue from './HttpQueue'
import LaravelApiModule from './modules/LaravelApiModule'
import LiveSearch from './components/LiveSearch.vue'
import PaginatedCollectionComponent from './components/PaginatedCollectionComponent'
import PaginationNav from './components/PaginationNav.vue'
import ResetsPage from './mixins/ResetsPage'
import SyncsWithUrl from './mixins/SyncsWithUrl'
import withHelper from './helpers/with'

export {

    /**
     * Components
     */
    ElementComponent,

    CollectionComponent,
    ContinuousCollectionComponent,
    PaginatedCollectionComponent,

    /**
     * These are deprecated; use CollectionComponent going forward.
     */
    CollectionComponent as ElementsComponent,
    ContinuousCollectionComponent as ContinuousElementsComponent,
    PaginatedCollectionComponent as PaginatedElementsComponent,

    LiveSearch,
    PaginationNav,

    /**
     * Vuex Modules
     */
    ApiModule,
    ElementApiModule,
    LaravelApiModule,

    /**
     * Mixins
     */
    ResetsPage,
    SyncsWithUrl,

    /**
     * Miscellaneous
     */
    HttpQueue,
    withHelper as with,
}
