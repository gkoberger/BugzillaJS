var usermenu_widget;

YAHOO.util.Event.onDOMReady(function() {
  usermenu_widget = new YAHOO.widget.Menu('usermenu_widget', { position : 'dynamic' });
  usermenu_widget.addItems([
    { text: 'Activity', url: '#', target: '_blank' },
    { text: 'Mail',     url: '#', target: '_blank' },
    { text: 'Edit',     url: '#', target: '_blank' }
  ]);
  usermenu_widget.render(document.body);
});

function show_usermenu(event, id, email, show_edit) {
  if (!usermenu_widget)
    return true;
  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
    return true;
  usermenu_widget.getItem(0).cfg.setProperty('url',
    'page.cgi?id=user_activity.html&action=run' +
    '&from=' + YAHOO.util.Date.format(new Date(new Date() - (1000 * 60 * 60 * 24 * 14)), {format: '%Y-%m-%d'}) +
    '&to=' + YAHOO.util.Date.format(new Date(), {format: '%Y-%m-%d'}) +
    '&who=' + encodeURIComponent(email));
  usermenu_widget.getItem(1).cfg.setProperty('url', 'mailto:' + encodeURIComponent(email));
  if (show_edit) {
    usermenu_widget.getItem(2).cfg.setProperty('url', 'editusers.cgi?action=edit&userid=' + id);
  } else {
    usermenu_widget.removeItem(2);
  }
  usermenu_widget.cfg.setProperty('xy', YAHOO.util.Event.getXY(event));
  usermenu_widget.show();
  return false;
}

