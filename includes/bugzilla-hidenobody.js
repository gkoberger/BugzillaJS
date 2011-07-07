registerPref('hidenobody', 'Have a "Show only assigned bugs" option?', loadHideNobody);

function loadHideNobody() {
    $('.bz_result_count').eq(0)
                         .after('<input id="hide-nobody" type="checkbox"> ' +
                                '<label for="hide-nobody">Show only assigned bugs'+
                                '</label>');

    hidenobody_val = false;

    _.storage.request('hidenobody_val', function(v){
        if(typeof hidenobody_val != "undefined") {
            hidenobody_val = v;
        }

        $('#hide-nobody').attr('checked', hidenobody_val);

        $('#hide-nobody').change(function(){
            hidenobody_val = $(this).is(':checked');
            _.storage.save('hidenobody_val', hidenobody_val, hideNobodyToggle);
            return false; // This seems wrong?
        });
        hideNobodyToggle();
    });

}

function hideNobodyToggle() {
    $('.bz_assigned_to_column').each(function(){
        if($(this).text().trim() == "nobody@mozilla.org") {
            $(this).closest('tr').toggle(!hidenobody_val);
        }
    });
}
