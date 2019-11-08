import ApiModule from "./modules/ApiModule";
import ContinuousElementsComponent from "./components/ContinuousElementsComponent";
import ElementApiModule from "./modules/ElementApiModule";
import ElementComponent from "./components/ElementComponent";
import ElementsComponent from "./components/ElementsComponent";
import HttpQueue from "./HttpQueue";
import LaravelApiModule from "./modules/LaravelApiModule";
import LiveSearch from "./components/LiveSearch.vue";
import PaginatedElementsComponent from "./components/PaginatedElementsComponent";
import PaginationNav from "./components/PaginationNav.vue";
import ResetsPage from "./mixins/ResetsPage";
import SyncsWithUrl from "./mixins/SyncsWithUrl";
import withHelper from "./helpers/with";

export default {

    /**
     * Components
     */
    ElementComponent,

    ElementsComponent,
    ContinuousElementsComponent,
    PaginatedElementsComponent,

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
    with: withHelper,
};
