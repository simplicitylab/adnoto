var Note = Backbone.Model.extend({
    urlRoot: 'api/v1/notebook/',

    parse : function(response, options){
        // when fetched occures from collection
        if (options.collection){
            return response;
        }else {
            return response.note;  
        }
    },
    
    url:function(){
        
        if (this.id) {
            return this.urlRoot + adnoto_app.active_notebook_id +  "/note/" + this.id;
        } else {
            return this.urlRoot + adnoto_app.active_notebook_id +  "/note";
        }
    }
});
var Notebook = Backbone.Model.extend({
    urlRoot: 'api/v1/notebook',
    
    parse : function(response, options){
        // when fetched occures from collection
        if (options.collection){
            return response;
        }else {
            return response.notebook;  
        }
    },
    
});
var Notebooks = Backbone.Collection.extend({
	model: Notebook,
    url: 'api/v1/notebooks',
    //url: 'test_json/notebooks.json',
    parse : function(response){
        return response.notebooks;  
    }
});
var Notes = Backbone.Collection.extend({
    
	model: Note,

    initialize: function(models, options) {
        this.notebook_id = options.notebook_id;
    },
    
    parse : function(response){
        return response.notes;  
    },
    
	url: function() {
        //console.log(this.notebook_id);
        return 'api/v1/notebook/' + this.notebook_id + '/notes';
    }
});
var NoteColorPickerView = Backbone.View.extend({
    
    el: $('#note-color-picker'),

	initialize: function(){
        
        var self = this;
        
        // bind window related events that color picker influences
        $(window).bind('click', function(event) {

            // if note color picker is visible
            if ( self.isVisible() ) {
                // be sure that target isn't the popover self
                if( $(event.target).hasClass('circle') == false ) {
                    // close
                    $('#note-color-picker').popover('hide');
                } else {
                    // handle color click    
                    var new_note_color = $(event.target).data('note-color');
                    
                    // set new color
                    self.setColor(new_note_color);
                    
                    // hide popover
                    $('#note-color-picker').popover('hide');
                }
            }

        });
	},  
    
    // set color
    setColor: function(color) {
        // set preview
        $('#color-preview').removeClass().addClass("circle big " + color);
        
        // set note color
        adnoto_app.noteView.setNoteColor(color);
    },
    
    // get visibility
    isVisible: function() {
        return this.visible;
    },
    
    // construct popup color content
    popupColorContent: function() {
        var template = _.template($('#template-color-picker').html());
        return template();
    },
    
    events: {
        // executed when the color in the navbar is clicked
        'click': function() {
            
            var self = this;
            
            $('#note-color-picker').popover({
                                            'html': true,
                                            'placement':'bottom',
                                            'trigger':'manual',
                                            'content': self.popupColorContent
                                            }).popover('show');
        },
        
        // bootstrap events
        'shown.bs.popover': function() {
            this.visible = true;
        },
        
        'hidden.bs.popover': function() {
            this.visible = false;
        }
    }
    
});

var NoteView = Backbone.View.extend({


    /**
     * Initialize
     **/
    initialize: function()
    {        
        // init CommonMark writer/reader
        this.MDWriter = new commonmark.HtmlRenderer();
        this.MDReader = new commonmark.DocParser();
        
        // init markdowneditor
        this.initMarkdownEditor();
        
        // hide markdown editor
        $('#markdownEditor').hide();

        // hide html preview
        $('#markdownPreview').hide();
        
        // set default mode to html
        this.mode = 'html';
    },
    
    /**
     * setup markdown editor
     **/
    initMarkdownEditor : function() {
        
        // setup editor
        this.markdownEditor = CodeMirror($('#markdownEditor')[0], {
          value: "",
          mode:  "markdown"
        });

    },
    
    /**
     * Set note color
     **/
    setNoteColor: function(color) {
        this.color = color;
    },
    
    
    /**
     * Reset not
     **/
    resetNote: function() {
        
        // reset title
        $('#note-title').html('');
        
        // reset markdown preview
        $('#markdownPreview').html('');
        
        // reset markdown editor
        this.markdownEditor.setValue('');      
        
        // reset buttons
        adnoto_app.disableContentButtons();
    },
    
    
    
    /**
     * Show note content
     **/
    showNote: function(note_id) {
        
        var self = this;

        // fetch page
        this.note = new Note({id : note_id});

        this.note.fetch({
            success: function(model) {
                                
                // set node id
                self.note_id = model.id;
                
                // set title 
                $('#note-title').html(model.get('title'));
                
                // get color
                self.color = model.get('color');
                
                // set color picker color
                adnoto_app.noteColorPickerView.setColor(self.color);
                
                // get markdown content
                self.markdownEditor.setValue(model.get('content'));
                
                // enable content buttons
                adnoto_app.enableContentButtons();
                
                // show markdown preview
                self.showMarkdownPreview();
                
            }
        });
        
    },
    
    /**
     * New note 
     **/
    newNote: function() {
        
        // reset note_id
        this.note_id = undefined; 
        
        // reset markdown editor content
        this.markdownEditor.setValue('');
        
        // reset title
        $('#note-title').html('');
        
        // show markdown editor
        this.showMarkdownEditor();        
    },
    
    /**
     * Get note
     **/
    getNote: function() {
        return this.note;
    },
    
    /**
     * Get note id
     **/
    getNoteId: function() {
        return this.note_id;
    },    
    
    /**
     * Get title
     **/
    getTitle: function() {
        return $('#note-title').html();
    },
    
    /**
     * Get color
     **/
    getColor: function() {
        return this.color;
    },
    
    
    /**
     * Get content
     **/
    getContent: function() {
        return this.markdownEditor.getValue();
    },
    
    /**
     * Toggle mode
     */
    toggleMode: function() {

        
        // current mode is html
        if (this.mode === 'html') {
            // set mode
            this.mode = 'markdown';
            
            // show markdown editor
            this.showMarkdownEditor();
            
        } else {
            // set mode
            this.mode = 'html';
            
            // show markdown preview
            this.showMarkdownPreview();
        }

        // render
        this.render();
    },
    
    /**
     * Show markdown editor
     **/
    showMarkdownEditor: function() {
                
        // switch button  mode text
        $('#btn-toggle-mode').html('<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span> View');
        
        // show markdown editor
        $('#markdownEditor').show();

        // hide html preview
        $('#markdownPreview').hide();
        
        // refresh markdown editor
        this.markdownEditor.refresh();
    },
    
    /**
     * Show markdown preview
     **/
    showMarkdownPreview: function() {
        
        // switch button  mode text
        $('#btn-toggle-mode').html('<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span> Edit');
        
        // store markdown editor content
        this.markdownContent = this.markdownEditor.getValue();

        // parse content
        var parsed = this.MDReader.parse(this.markdownContent);
        var content  = this.MDWriter.renderBlock(parsed);

        // set markdown preview value
        $('#markdownPreview').html(content);

        // hide markdown editor
        $('#markdownEditor').hide();

        // show html preview
        $('#markdownPreview').show();

        // Prism highlight
        Prism.highlightAll();

    },

});

var NoteBooksView = Backbone.View.extend({
	el: $('#list-notebooks'),

	initialize: function(){
        	        
        // refresh notebooks
        this.refreshNotebooks();
	},
    
    /**
     * refresh notebooks
     **/
    refreshNotebooks: function(){
        
        var self = this;
        
        this.collection = new Notebooks();

        if (this.collection != undefined ) {
            // fetch collection on success render view
            this.collection.fetch({
                success: function(collection) {
                    // render 
                    self.render();
                } 
            });
        }
    },
    
    events: {
        // handle name click
        'click a': function(event) {
            
            // clear previous active
            $('#list-notebooks>li.active').removeClass('active');
            
            // get notebook id 
            var notebook_id = $(event.target).data('notebook-id');
            
            // add active class to parent
            $(event.target).closest('li').addClass('active');
            
            // store notebook id
            adnoto_app.active_notebook_id = notebook_id;
            
            // update notes list
            adnoto_app.notesListView.showNotes(notebook_id);
            
            // reset node view
            adnoto_app.noteView.resetNote();
        },
        // handle delete click
        'click i.delete-notebook': function(event) {
            
            // get notebook id
            var notebook_id = $(event.target).data('notebook-id');
            
            // clear input
            $('#dlg-delete-notebook-input-notebook-name').val('');
            
            // get notebook name and pass it to the dialog
            var notebook_name = $(event.target).next('a').html();
            $('#dlg-delete-noteboook-span-notebook-name').html(notebook_name);
            
            // store note id
            $('#dlg-delete-notebook-hidden-notebook-id').val(notebook_id);
            
            // show delete notebook dialog
            $('#dlg-delete-notebook').modal('show');
        }        
    },

	render: function() {
        
        // get template
		var template = _.template($('#template-notebooks-list').html());
        
		// render compiled html to element
		this.$el.html(template({ notebooks: this.collection.models,
                                 active_notebook_id : adnoto_app.active_notebook_id
        }));
        
	}
    
    
});
var NotesView = Backbone.View.extend({
	el: $('#list-group-container'),

    /**
     * Default init
     **/
	initialize: function(){
        	        
	},
    
    /**
     * Show notes for notebook
     **/
    showNotes: function(notebook_id) {
        
        var self = this;
        
        // assign 'internal' collection to new Notes
		this.collection = new Notes([], { notebook_id: notebook_id});

        // fetch collection on success render view
		this.collection.fetch({
			success: function(collection) {
				self.render();
			} 
		});

    },
    
    
    /**
     * Reset notes
     **/
    resetNotes: function() {
        // remove notes
        $('#list-group-container').html('');
    },
    
    /**
     * Refresh noes
     **/
    refreshNotes: function() {
        
        var self = this;
        
        // assign 'internal' collection to new Notes
		this.collection = new Notes([], { notebook_id: adnoto_app.active_notebook_id });

        // fetch collection on success render view
		this.collection.fetch({
			success: function(collection) {
				self.render();
			} 
		});

    },
    
    /**
     * Filter notes
     **/
    filterNotes: function(filter) {
        
        if (filter.length > 0 ) {
            // store filter
            this.filter = filter;
        } else {
            // store filter
            this.filter = undefined;
        }
        
        // re-render list
        this.render();
    },
    
    /**
     * Events
     **/
    events: {
        'click .list-group-item' : function(event) {
            
            // clear previous active
            $('#list-group-container>a.active').removeClass('active');
            
            // get note id
            var note_id = $(event.currentTarget).data('note-id');
            
            // add active class
            $(event.currentTarget).addClass('active');
                        
            // show note
            adnoto_app.noteView.showNote(note_id);

        }
    },

	render: function() {
        
        var self = this;
        
        // get template
		var template = _.template($('#template-notes-list').html());
        
        if (this.filter != undefined) {
            
            // filter collection
            var filtered_collection = _.filter(this.collection.models, function(note) {
                return note.get('title').toLowerCase().indexOf(self.filter.toLowerCase()) > -1;
            });
            
            // render compiled html to element
            this.$el.html(template({ notes: filtered_collection }));
            
        } else {
            
            // render compiled html to element
            this.$el.html(template({ 
                notes: this.collection.models,
                active_note_id: adnoto_app.active_note_id 
            }));
            
        }
	}
    
    
});
/**
 * Enable content related buttons
 **/
adnoto_app.enableContentButtons = function() {
    $('#btn-toggle-mode').removeAttr('disabled');
    $('#btn-delete-note').removeAttr('disabled');
    $('#btn-save-note').removeAttr('disabled');
};

/**
 * Disable content related buttons
 **/
adnoto_app.disableContentButtons = function() {
    $('#btn-toggle-mode').attr('disabled', true);
    $('#btn-delete-note').attr('disabled', true);
    $('#btn-save-note').attr('disabled', true);
};


/**
 * setup Views‡
 **/
var setupViews = function() {
    
    // init colorpicker view
    adnoto_app.noteColorPickerView = new NoteColorPickerView();
    
    // init notebooks list view
    adnoto_app.notebooksListView = new NoteBooksView();
    
    // init notes list view
    adnoto_app.notesListView = new NotesView();
    
    // init note view
    adnoto_app.noteView = new NoteView();
};
/**
 * Window events
 **/
$(document).ready(function(){
    
    // watch resize event
    $(window).bind('resize', function(){
        // update layout elements
        adnoto_app.updateLayoutElements();    
    });

    /**
     * Handle notebook context menu
     **/
    $(window).mousedown(function(event){ 
                
        // be sure it is a right click on a notebook item
        if ( $(event.target).hasClass('notebook-item') && event.button == 2 ) {
            // store right click id 
            adnoto_app.right_click_notebook_id = $(event.target).data('notebook-id');            
        } 
        
        return true; 
    }); 
    
    $('#menu_notebook_rename').bind('click', function(event) {        
        
        // find notebook with id 
        var notebook_name = $('#list-notebooks')
                            .find('a[data-notebook-id="' +  adnoto_app.right_click_notebook_id +'"]')
                            .html();
        
        // set notebook name
        $('#dlg-rename-notebook-span-notebook-name').html(notebook_name);
        
        // reset input
        $('#dlg-rename-notebook-input-notebook-name').val('');
        
        // show dialog
        $('#dlg-rename-notebook').modal('show');
    });
    
    /**
     * Setup UI buttons
     **/
    $('#add-notebook-container').bind('click', function() {
        $('#dlg-new-notebook').modal('show');
    });
    
    $('#btn-new-note').bind('click', function() {
        $('#dlg-new-note').modal('show');
    });
    
    $('#btn-toggle-mode').bind('click', function() {
        adnoto_app.noteView.toggleMode();
    });
    
    $('#btn-delete-note').bind('click', function() {
        
        // get note title and pass it to the dialog
        var note_title = $('#list-group-container').find('.active').find('h4').html();
        $('#dlg-delete-note-span-note-name').html(note_title);
        
        // reset input
        $('#dlg-delete-note-input-note-name').val('');
        
        // show dialog
        $('#dlg-delete-note').modal('show');        
    });
    
    $('#btn-save-note').bind('click', function() {
        
        // update note
        adnoto_app.noteView.getNote().set({
            "title": adnoto_app.noteView.getTitle(),
            "color": adnoto_app.noteView.getColor(),
            "content": adnoto_app.noteView.getContent()
        });
        
        // save note
        adnoto_app.noteView.getNote().save();
    
        // refresh note
        adnoto_app.notesListView.refreshNotes();
        
    });    
    
    // add on keyup event for searchbox
    $('#input-search').keyup(function() {
        // filter notes
        adnoto_app.notesListView.filterNotes($(this).val());
    });
    
    /**
     * Setup dialog buttons
     **/
    
    // dialog new notebook
    $('#dlg-new-notebook-btn-create').bind('click', function() {
        // get noteboook name
        var notebook_name = $('#dlg-new-notebook-input-notebook-name').val();

        // be sure that notebook name is given
        if (notebook_name.length > 0 ) {
            
            // hide dialog
            $('#dlg-new-notebook').modal('hide');

            // create new notebook
            var notebook = new Notebook();
            notebook.set({ 'name' : notebook_name});
            
            // save in dbase
            notebook.save(null, {  
                // on success
                success: function (model, response) {
                                        
                    // set active notebook
                    adnoto_app.active_notebook_id = model.id;
                                        
                    // refresh list
                    adnoto_app.notebooksListView.refreshNotebooks();
                    
                    // reset notes
                    adnoto_app.notesListView.resetNotes();
                    
                    // reset not
                    adnoto_app.noteView.resetNote();
                    
                }
            });
                    }
    });
    
    // dialog delete notebook
    $('#dlg-delete-notebook-btn-delete').bind('click', function() {
                
        // get notebook name        
        var notebook_name = $('#dlg-delete-noteboook-span-notebook-name').html();

        // if notebook name is same as input name
        if( notebook_name == $('#dlg-delete-notebook-input-notebook-name').val() ) {
            // hide dialog
            $('#dlg-delete-notebook').modal('hide');
            
            // get notebook id 
            var notebook_id = $('#dlg-delete-notebook-hidden-notebook-id').val();
            
            // find notebook
            var notebook = new Notebook({ id: notebook_id});
            
            // delete
            notebook.destroy();
            
            // refresh notebooks list
            adnoto_app.notebooksListView.refreshNotebooks();
        }
        
    });        

    // dialog new note
    $('#dlg-new-note-btn-create').bind('click', function() {
        
        // get note title
        var note_title = $('#dlg-new-note-input-note-title').val();
                
        if (note_title.length > 0 ) {
            
            // hide dialog
            $('#dlg-new-note').modal('hide');

            // create new note
            var note = new Note();
            note.set({ 'title' : note_title, 'content': ''});
            
            // save in dbase
            note.save(null, {
                // on success
                success: function (model, response) {  
                                        
                    // set active note
                    adnoto_app.active_note_id = model.id;
                    
                    // refresh list
                    adnoto_app.notesListView.refreshNotes();
                    
                    // show note
                    adnoto_app.noteView.showNote(model.id);
                    
                }
            });
        }
        
    });   
    
    // dialog delete note
    $('#dlg-delete-note-btn-delete-note').bind('click', function() {
        
        // get note id
        var note_id = $('#list-group-container').find('.active').data('note-id');
                
        // get note title        
        var note_title = $('#list-group-container').find('.active').find('h4').html();
        
        // if note title is same as input name
        if( note_title == $('#dlg-delete-note-input-note-name').val() ) {
            
            // hide dialog
            $('#dlg-delete-note').modal('hide');
            
            // destroy note
            adnoto_app.noteView.getNote().destroy();
            
            // refresh note
            adnoto_app.notesListView.refreshNotes();
            
            // reset note
            adnoto_app.noteView.resetNote();
        }
        
    });     
    
    // dialog to rename notebook
    $('#dlg-new-note-btn-rename').bind('click', function() {

        // get new note name
        var new_note_name = $('#dlg-rename-notebook-input-notebook-name').val();
        
        // be sure that new note name is given
        if (new_note_name.length > 0 ) {
            
            // update notebook
            var notebook = new Notebook({id: adnoto_app.right_click_notebook_id});
            notebook.set({ 'name' : new_note_name});
            
            notebook.save(null, {
                // on success
                success: function (model, response) {  
                    
                    // hide dialog 
                    $('#dlg-rename-notebook').modal('hide');                    
                    
                    // refresh notebooks list
                    adnoto_app.notebooksListView.refreshNotebooks();
                }
            });
        }
        
    });     
    
    
        
    // setup views 
    setupViews();
        
    // send resize event to window
    $(window).trigger('resize');
});
adnoto_app.layout = {};

/**
 * Calculates layout properties
 **/
adnoto_app.calculateLayoutProperties = function() {
    
    // top navbar height will be only calculated once
    if (adnoto_app.layout.topBarHeight == undefined) {
        adnoto_app.layout.topBarHeight = $('#top-navbar').outerHeight();
    }
    
    // notes navbar height will be only calculated once
    if (adnoto_app.layout.notesBarHeight == undefined) {
        adnoto_app.layout.notesBarHeight = $('#notes-navbar').outerHeight();
    }
    
    // notes editor-content-navbar height will be only calculated once
    if (adnoto_app.layout.editorContentBarHeight == undefined) {
        adnoto_app.layout.editorContentBarHeight = $('#editor-content-navbar').outerHeight();
    }

    // notebook section title height will be only calculated once
    if (adnoto_app.layout.notebookSectionTitleHeight == undefined) {
        adnoto_app.layout.notebookSectionTitleHeight = $('#notebook-section-title').outerHeight();
    }
    
    // note title height will be only calculated once
    if (adnoto_app.layout.noteTitleHeight == undefined) {
        adnoto_app.layout.noteTitleHeight = $('#note-title').outerHeight();
    }    
    
    
    // width of sidebar notebooks will be only calculated once    
    if (adnoto_app.layout.sidebarNotebooksWidth == undefined) {
        adnoto_app.layout.sidebarNotebooksWidth = $('#sidebar-notebooks-tags').outerWidth();
    }

    // width of sidebar notes will be only calculated once    
    if (adnoto_app.layout.sidebarNotesWidth == undefined) {
        adnoto_app.layout.sidebarNotesWidth = $('#sidebar-notes').outerWidth();
    }
    
    // get and store viewport height
    adnoto_app.layout.viewportHeight = $(window).height();
    
    // get and store viewport width
    adnoto_app.layout.viewportWidth = $(window).width();
    
    // calculate main container height
    adnoto_app.layout.mainContainerHeight = adnoto_app.layout.viewportHeight
                                                       - adnoto_app.layout.topBarHeight;
    
    // calculate main container element heights
    adnoto_app.layout.mainElementsHeight = adnoto_app.layout.viewportHeight 
                                                      - adnoto_app.layout.topBarHeight;
    
    // calculate content-editor width
    adnoto_app.layout.contentEditorWidth = adnoto_app.layout.viewportWidth 
                                                      - (adnoto_app.layout.sidebarNotebooksWidth 
                                                      + adnoto_app.layout.sidebarNotesWidth);
    
    // calculate notes-list-container-height
    adnoto_app.layout.listNotesContainerHeight = adnoto_app.layout.viewportHeight  
                                                            - adnoto_app.layout.topBarHeight 
                                                            - adnoto_app.layout.notesBarHeight;
 
    // calculate list-notebooks-container height
    adnoto_app.layout.listNotebooksContainer = adnoto_app.layout.viewportHeight  
                                                          - adnoto_app.layout.topBarHeight 
                                                          - adnoto_app.layout.notebookSectionTitleHeight
                                                          - 20; // padding
    
    // calculate content container height
    adnoto_app.layout.contentContainerHeight = adnoto_app.layout.viewportHeight
                                               - adnoto_app.layout.topBarHeight
                                               - adnoto_app.layout.noteTitleHeight
                                               - adnoto_app.layout.editorContentBarHeight
                                               - 60; // padding
                                                   
}

/**
 * Updates layout elements 
 **/
adnoto_app.updateLayoutElements = function() {
    
    // calculate layout properties
    adnoto_app.calculateLayoutProperties();

    // update height main container
    $('#main-container').css('height', adnoto_app.layout.mainContainerHeight + 'px');
    
    // update main elements height
    $('#sidebar-notebooks-tags').css('height', adnoto_app.layout.mainElementsHeight + 'px');
    $('#sidebar-notes').css('height', adnoto_app.layout.mainElementsHeight + 'px');
    $('#content-editor-container').css('height', adnoto_app.layout.mainElementsHeight + 'px');
    
    // update notes-list-container
    $('#list-group-container').css('height', adnoto_app.layout.listNotesContainerHeight + 'px');
    
    // update list notebooks container
    $('#list-notebooks-container').css('height', adnoto_app.layout.listNotebooksContainer + 'px');    
    
    // update content-editor width
    $('#content-editor-container').css('width', adnoto_app.layout.contentEditorWidth + 'px');
    
    // update container content height
    $('#content-container').css('height', adnoto_app.layout.contentContainerHeight + 'px');    
    
}