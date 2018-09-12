function TabsControl (ontology, viewport)
{
    var that = this,
    conceptId = $('#concept_id');

    // tabs ----------------------------------------------------------------------------------------
    $('#tabs').tabs (
    {
        active: false,
        activate: function (evnt, ui)
        {
            if (ui.newTab.text () == 'Search')
                searchText.focus ();

            viewport.hollowFaceStop ();
        },
        collapsible: true,
        hide: { effect: "blind", duration: 200 },
        show: { effect: "blind", duration: 200 },
    });

    // loaded tab ----------------------------------------------------------------------------------
    $('#loaded_toolbar').buttonset ();
    $("#btn_help").button ({ text: false, icons: { primary: "ui-icon-help" }})
                  .tooltip ({ show: { delay: 1000 }})
                  .click (function () { help (); });

    var loadedResult = $('#loaded_result');
    var CBCbtn = $('#CBC'), Mdlabtn = $('#Mdla'), FrCbtn = $('#FrC'), Pmenbtn = $('#Pmen'), TCbtn = $('#TC');
    var Tmusbtn = $('#Tmus'), Hippobtn = $('#Hippo'), OccCbtn = $('#OccC'), SubNigbtn = $('#SubNig'), SWMbtn = $('#SWM');

    CBCbtn.button ().click (function(event)
    {
        showConcept('partof.FMA67944', false);
    });
    Mdlabtn.button ().click (function(event)
    {
        showConceptBlue('isa.FMA62004', false);
    });
    FrCbtn.button ().click (function(event)
    {
        showConcept ('partof.FMA242207', false);
        showConcept ('partof.FMA242209', false);
    });
    Pmenbtn.button ().click (function(event)
    {
        showConcept ('isa.FMA61834', false);
    });
    TCbtn.button ().click (function(event)
    {
        showConcept ('isa.FMA61906', false);
        showConcept ('isa.FMA61907', false);
        showConcept ('isa.FMA70701', false);
        showConcept ('isa.FMA70703', false);
    });
    Tmusbtn.button ().click (function(event)
    {
        showConcept ('isa.FMA62007', false);
    });
    Hippobtn.button ().click (function(event)
    {
        showConcept ('isa.FMA62493', false);
    });
    OccCbtn.button ().click (function(event)
    {
        showConcept ('isa.FMA67325', false);
    });
    SubNigbtn.button ().click (function(event)
    {
        showConcept ('isa.FMA67947', false);
    });
    SWMbtn.button ().click (function(event)
    {
        showConcept ('isa.FMA241998', false);
    });
    Mdlabtn.selectable (
        {
            selected: function (evnt, ui)
            {
                var key = $(ui.selected).data ('concept');
                // conceptId.text (key);
                ontology.conceptRetrieved (key).done (function (concept)
                {
                    viewport.select (concept);
                });
            },
            unselected: function (evnt, ui)
            {
                var key = $(ui.unselected).data ('concept');
                // conceptId.text ('');
                ontology.conceptRetrieved (key).done (function (concept)
                {
                    viewport.deselect (concept);
                });
            }
        });
    // search tab ----------------------------------------------------------------------------------
    var searchText = $('#search_text'), searchResult = $('#search_result'), searchBtn = $('#search_btn');

    searchBtn.button ().click (function (evnt)
    {
        searchText.prop ('disabled', true);
        searchBtn.button ('disable');

        $.when.apply ($, $('li.ui-selected', searchResult).map (function (i, elmnt)
        {
            return ontology.conceptRetrieved ($(elmnt).data ('concept')).done (function (concept)
            {
                viewport.deselect (concept);
            });
        })).then (function ()
        {
            ontology.search (searchText.val ()).done (function (list)
            {
                var li = [];
                list.forEach (function (el)
                {
                    li.push ('<li data-concept="' + el.key + '" class="ui-selectee">' + el.name + '</li>');
                });

                searchResult.html (li.join (''));

                searchText.prop ('disabled', false);
                searchBtn.button ('enable');
            });
        });
    });

    searchResult.selectable (
    {
        selected: function (evnt, ui)
        {
            var key = $(ui.selected).data ('concept');
            // conceptId.text (key);
            ontology.conceptRetrieved (key).done (function (concept)
            {
                viewport.select (concept);
            });
        },
        unselected: function (evnt, ui)
        {
            var key = $(ui.unselected).data ('concept');
            // conceptId.text ('');
            ontology.conceptRetrieved (key).done (function (concept)
            {
                viewport.deselect (concept);
            });
        }
    });

    searchText.keydown (function (evnt)
    {
        if (evnt.keyCode == 38 || evnt.keyCode == 40 || evnt.keyCode == 188) // up/down/,
            evnt.preventDefault ();
    });

    searchText.keyup (function (evnt)
    {
        switch (evnt.keyCode)
        {
            case 13: // enter
                if (evnt.ctrlKey)
                {
                    var selected = $('.ui-selected', searchResult);
                    if (selected.length)
                        showConcept (selected.data ('concept'), false);
                }
                else if (evnt.shiftKey)
                {
                    var selected = $('.ui-selected', searchResult);
                    if (selected.length)
                        showConcept (selected.data ('concept'), true);
                }
                else
                {
                    $('#search_btn').click ();
                }
                break;
            case 38: // up
                var selected = $('.ui-selected', searchResult);
                    last     = $('li:last',      searchResult);
                if (selected.length)
                {
                    selected.removeClass ('ui-selected');
                    (selected.prev ('li').length ? selected.prev ('li') : last).addClass ('ui-selected');
                }
                else
                {
                    last.addClass ('ui-selected');
                }
                break;
            case 40: // down
                var selected = $('.ui-selected',   searchResult);
                    first    = $('li:first-child', searchResult);
                if (selected.length)
                {
                    selected.removeClass ('ui-selected');
                    (selected.next ('li').length ? selected.next ('li') : first).addClass ('ui-selected');
                }
                else
                {
                    first.addClass ('ui-selected');
                }
                break;
        }
    });

    // init view
    if (location.hash)
    {
        var str = decodeURI (location.hash.substring (1));

        if (str === 'hollow-face')
        {
             viewport.hollowFaceStart ();
        }
        else
        {
            var strs = str.split ('|'); if (strs.length != 2) return;

            var opaqueOrgan      = strs[0];
            var transparentOrgan = strs[1];

            $('#tabs').tabs ('option', 'active', 0);
            showConcept (opaqueOrgan, false);
            showConcept (transparentOrgan, true);
        }
    }
    else
    {
        $('#tabs').tabs ('option', 'active', 0);
        showConcept ('partof.FMA50801', true);
    }

    function unpinSelected ()
    {
        var selected = $('li > span.ui-selected', loadedResult);
        selected.parent ().removeClass ();
        selected.parent ().children ('ul').remove ();
        selected.parent ().children ('button').children ('span').removeClass ('ui-icon-minus').addClass ('ui-icon-plus');

        selected.removeClass ('ui-selected');
        if (selected.length != 0)
        {
            viewport.deselect ({ fileIds: selected.parent ().data ('fileIds') });
            viewport.hide     ({ fileIds: selected.parent ().data ('fileIds') });
        }
    }

    function refresh ()
    {
        loadedResult.children ('li').not ('.loaded').remove ();
        loadedResult.children ('li.loaded').children ('ul').remove ();
        loadedResult.children ('li.loaded').children ('button').children ('span')
                    .removeClass ('ui-icon-minus').addClass ('ui-icon-plus');
    }

    function help ()
    {
        $('#loaded_toolbar button').each (function (i, el)
        {
            var start = i * 2000, stop = start + 2000;
            setTimeout (function () { $(el).tooltip ('open'); }, start);
            setTimeout (function () { $(el).tooltip ('close'); }, stop);
        });
    }


    function createLi (concept, classes)
    {
        return $('<li/>')
            .attr ('data-concept', concept.key)
            .data ('fileIds', concept.fileIds)
            .addClass (classes)
            .append ($('<button/>').button ({ text: false, icons: { primary: 'ui-icon-plus'}})
                                   .removeClass ('ui-button-icon-only')
                                   .click (function (evnt) { parentsToggle (this); evnt.stopPropagation (); })
                                   .focus (function () { this.blur (); }))
            .append ($('<span/>').text (concept.name).click (function (evnt) { select (this); evnt.stopPropagation (); }))
            .append ($('<button/>').button ({ text: false, icons: { primary: 'ui-icon-plus'}})
                                   .removeClass ('ui-button-icon-only')
                                   .click (function (evnt) { childrenToggle (this); evnt.stopPropagation (); })
                                   .focus (function () { this.blur (); }));
    }

    //Concepts
    function showConcept (treeConceptId, isTransparent)
    {
        ontology.conceptRetrieved (treeConceptId).done (function (concept)
        {
            concept.transparent = isTransparent;
            viewport.show (concept);
            loadedResult.append (createLi (concept, 'loaded' + (isTransparent ? ' transparent' : '')));
            console.log (concept.name + '(' + treeConceptId + ')');
        });
    };

    function showConceptBlue (treeConceptId, isTransparent)
    {
        ontology.conceptRetrieved (treeConceptId).done (function (concept)
        {
            concept.transparent = isTransparent;
            viewport.showB (concept);
            loadedResult.append (createLi (concept, 'loaded' + (isTransparent ? ' transparent' : '')));
            console.log (concept.name + '(' + treeConceptId + ')');
        });
    };

    function select (that)
    {
        var oldSelected = $('li > span.ui-selected', loadedResult);
        deselectSpan (oldSelected);

        if (!oldSelected.is ($(that)))
            selectSpan ($(that));
    }

    function selectSpan (liSpan)
    {
        // conceptId.text (liSpan.parent ().data ('concept'));

        liSpan.addClass ('ui-selected');

        if (liSpan.parent ().hasClass ('transparent'))
            var isTransparent = true;

        viewport.select ({ transparent: isTransparent, fileIds: liSpan.parent ().data ('fileIds') });
    }

    function deselectSpan (liSpan)
    {
        // conceptId.text ('');

        liSpan.removeClass ('ui-selected');

        if (liSpan.length != 0)
            viewport.deselect ({ fileIds: liSpan.parent ().data ('fileIds') });
    }
}
