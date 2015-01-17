define(['jquery', 'lib/Backbone.View.Elements'], function ($, ElementsView) {
    /**
     * @class ListView
     * @extends ElementsView
     */
    var ListView = ElementsView.extend(/**@lends ListView*/{
        _selectors: function () {
            var removingButton = '.list__remove-item-button';
            return {
                itemByNumber: '.list__item[data-item-number=%s]',
                removingButton: removingButton,
                removingButtonByNumber: removingButton + '[data-item-number=%s]'
            };
        },

        events: function () {
            var events = {};
            events['click ' + this._selector('removingButton')] = this._onRemovingButtonClick;
            return events;
        },

        _onRemovingButtonClick: function (e) {
            var itemNumber = $(e.currentTarget).data('itemNumber');
            this._removeItem(itemNumber);
        },

        _removeItem: function (itemNumber) {
            this._elem('itemByNumber', itemNumber).remove();
            this._elem('removingButtonByNumber', itemNumber).remove();
        }
    });

    return ListView;
});
