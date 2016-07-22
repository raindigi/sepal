/**
 * Application Events class
 *
 * @author Mino Togna
 */

var Events = {
    
    AJAX: {
        REQUEST: 'ajax'
    }
    
    , APP: {
        LOAD            : 'app.load'
        , DESTROY       : 'app.destroy'
        , USER_LOGGED_IN: 'app.user-logged-in'
    }
    
    , LOGIN: {
        HIDE  : 'login.hide'
        , SHOW: 'login.show'
    }
    
    , SECTION: {
        CLOSE_ALL: 'section.close-all'
        , SHOW   : 'section.show'
        , SHOWN  : 'section.shown'
        , REDUCE: 'section.reduce'
        
        , SEARCH         : {
            // SHOW_SCENE_AREA: 'section.search.show-scene-area'
            FORM_SUBMIT         : 'section.search.form-submit'
            , SCENE_AREAS_LOADED: 'section.search.scene-areas-loaded'
            // , RETRIEVE          : 'section.search.retrieve'
            // , MOSAIC            : 'section.search.mosaic'
        }
        , SEARCH_RETRIEVE: {
            BEST_SCENES      : 'section.search-retrieve.best-scenes'
            , RETRIEVE_SCENES: 'section.search-retrieve.retrieve-scenes'
            , PREVIEW_MOSAIC : 'section.search-retrieve.preview-mosaic'
            , RETRIEVE_MOSAIC: 'section.search-retrieve.retrieve-mosaic'
        }
        
        , BROWSE: {
            NAV_ITEM_CLICK : 'section.browse.nav-item-click'
            , DOWNLOAD_ITEM: 'section.browse.download-item'
        }
        
        , PROCESS: {}
        
        , TERMINAL: {}
        
        , SCENES_SELECTION: {
            RESET                     : 'section.scenes-selection.reset'
            , UPDATE_VIEW             : 'section.scenes-selection.update-view'
            , SELECT                  : 'section.scenes-selection.select'
            , DESELECT                : 'section.scenes-selection.deselect'
            , RELOAD_SCENES           : 'section.scenes-selection.reload-scenes'
            , SORT_CHANGE             : 'section.scenes-selection.sort-change'
            , FILTER_SHOW_SENSOR      : 'section.scenes-selection.filter-show-sensor'
            , FILTER_HIDE_SENSOR      : 'section.scenes-selection.filter-hide-sensor'
            , FILTER_TARGET_DAY_CHANGE: 'section.scenes-selection.filter-target-day-change'
        }
        
        , TASK_MANAGER: {
            REMOVE_TASK   : 'section.task-manager.remove-task'
            , CANCEL_TASK : 'section.task-manager.cancel-task'
            , EXECUTE_TASK: 'section.task-manager.execute-task'
            , CHECK_STATUS: 'section.task-manager.check-status'
        }
        
        , USER: {
            REMOVE_SESSION: 'section.user.remove-session'
        }
    }
    
    , MAP: {
        ZOOM_TO                       : 'map.zoom-to'
        // , LOAD_SCENE_AREAS: 'map.load-scene-areas'
        , SCENE_AREA_CLICK            : 'map.scene-area-click'
        , ADD_LAYER                   : 'map.add-layer'
        , ADD_EE_LAYER                : 'map.add-ee-layer'
        , REMOVE_EE_LAYER             : 'map.remove-ee-layer'
        , EE_LAYER_TOGGLE_VISIBILITY  : 'map.remove-ee-layer-toggle-visibility'
        , SCENE_AREA_RESET            : 'map.scene-area-reset'
        , SCENE_AREA_TOGGLE_VISIBILITY: 'map.scene-area-toggle-visibility'
        , ADD_OVERLAY_MAP_TYPE        : 'map.add-overlay-map-type'
        , REMOVE_OVERLAY_MAP_TYPE     : 'map.remove-overlay-map-type'
    }
    
    // events that occur when a model changes
    , MODEL: {
        SCENE_AREA: {
            CHANGE: 'model.scene-area-change'
        }
    }
    
}

module.exports = Events