var Note = Backbone.Model.extend({
    url:function(){ 
       return 'test_json/note.json';
    },
});
var Notebook = Backbone.Model.extend({
    urlRoot: 'api/v1/notebook'
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
    
	url: function() {
        //console.log(this.notebook_id);
        return 'test_json/notes.json';
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

    //el: $('#content-container'),

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
     * Get note content
     **/
    getNote: function(note_id) {
        
        var self = this;

        // fetch page
        this.note = new Note({id : note_id});

        this.note.fetch({
            success: function(model) {
                                
                // set node id
                self.note_id = model.id;
                
                // set title 
                $('#note-title').html(model.get('title'));
                
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
     * Save note
     **/
    saveNote: function() {
        console.log('save note ' + this.note_id);
    },
    
    /**
     * Delete noe
     **/
    deleteNote: function() {
        console.log('delete note ' + this.note_id);
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
        
		// assign 'internal' collection to new SongsCollection
		this.collection = new Notebooks();
	        
        // refresh notebooks
        this.refreshNotebooks();
	},
    
    /**
     * refresh notebooks
     **/
    refreshNotebooks: function(){
        
        var self = this;

        if (this.collection != undefined ) {
            // fetch collection on success render view
            this.collection.fetch({
                success: function(collection) {
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
		this.$el.html(template({ notebooks: this.collection.models }));
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
            this.$el.html(template({ notes: this.collection.models }));
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
 * setup Views‡
 **/
var setupViews = function() {
    
    // init colorpicker view
    adnoto_app.noteColorPickerView = new NoteColorPickerView();
    
    // init notebooks list view
    adnoto_app.notebooksListView = new NoteBooksView();
    
    // init notes list view
    adnoto_app.notesListView = new NotesView();
    adnoto_app.notesListView.showNotes(1);
    
    // init note view
    adnoto_app.noteView = new NoteView();
    adnoto_app.noteView.getNote(1);
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
     * Setup context menu
     **/
    $('#menu_notebook_rename').bind('click', function() {
        
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
        adnoto_app.noteView.saveNote();
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

        if (notebook_name.length > 0 ) {
            
            // hide dialog
            $('#dlg-new-notebook').modal('hide');

            // create new notebook
            var notebook = new Notebook();
            notebook.set({ 'name' : notebook_name});
            
            // save in dbase
            notebook.save();
            
            // refresh list
            adnoto_app.notebooksListView.refreshNotebooks();
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
            
            // get note id 
            var note_id = $('#dlg-delete-notebook-hidden-notebook-id').val();
            
            // find notebook
            var notebook = new Notebook({ id: note_id});
            
            // delete
            notebook.destroy();
            
            // refresh notebooks list
            adnoto_app.notebooksListView.refreshNotebooks();
        }
        
    });        

    // dialog new note
    $('#dlg-new-note-btn-create').bind('click', function() {
        // get note title
        var note_title = $('#dlg-delete-note-span-note-name').html();

        if (note_title.length > 0 ) {
            
            // hide dialog
            $('#dlg-new-note').modal('hide');

            console.log('create new note : ' + note_title);
        }
    });   
    
    // dialog delete note
    $('#dlg-delete-note-btn-delete-note').bind('click', function() {
        // get note title        
        var note_title = $('#list-group-container').find('.active').find('h4').html();
        
        // if note title is same as input name
        if( note_title == $('#dlg-delete-note-input-note-name').val() ) {
            // hide dialog
            $('#dlg-delete-note').modal('hide');
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