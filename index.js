var Data = {
    Products: [
        { id: 1, name: "Prod1", price: 12.2 },
        { id: 2, name: "Prod2", price: 21.3 },
        { id: 3, name: "Prod3", price: 120.0 },
        { id: 4, name: "Prod4", price: 35.6 },
        { id: 5, name: "Prod5", price: 15.7 },
        { id: 6, name: "Prod6", price: 1.2 }
    ],
    Order: []
};

function orderEntry(prod) {
    Object.assign(this, prod);

    this.quantity = 1;
    Object.defineProperty(this, 'subTotal', {
        enumerable: true, // Make it seriazable to JSON.
        get: () => this.price * this.quantity
    });
}

Object.defineProperty(Data.Order, 'Total', {
    get: function() {
        var total = 0;
        if(this.length)
            this.map(e => total += e.subTotal);
        return total;
    }
});

Data.Order.Add = function (item) {
    var oe = new orderEntry(item);
    this.push(oe);
    return oe;
};

Data.Order.Remove = function (item) {
    var pos = this.indexOf(item);
    if (pos > -1)
        this.splice(pos, 1);
};

var App;
function start() {

    Vue.filter('currency', (value, decimals) => {
        if (!value) return '';
        value = value.toLocaleString("pt-PT", { maximumFractionDigits: decimals || 2, style: "currency", currency: "EUR" });
        return value;
    });

    Vue.component("cp-product-entry", {
        data: () => {
            return {
                orderEntry: null
            };
        },
        props: {
            product: Object
        },
        mounted: function () {
            var vm = this;
            this.$root.$on("removedItemFromOrder", function (entry) {
                if (vm.orderEntry && vm.orderEntry === entry)
                    vm.orderEntry = null;
            });
        },
        methods: {
            addItemToOrder: function (prod) {
                this.orderEntry = Data.Order.Add(prod);
            },
            removeItemFromOrder: function (entry) {
                if (entry)
                    Data.Order.Remove(entry);
                this.orderEntry = null;
            }
        },
        template: "#tp-product-entry"
    });

    Vue.component("cp-products", {
        data: () => {
            return {
                list: Data.Products
            };
        },
        methods: {
        },
        template: "#tp-products"
    });

    Vue.component("cp-order", {
        data: () => {
            return {
                list: Data.Order
            };
        },
        methods: {
            removeItemFromOrder: function (item) {
                Data.Order.Remove(item);
                App.$emit("removedItemFromOrder", item);
            }
        },
        template: "#tp-order"
    });

    Vue.component("cp-resume", {
        data: () => {
            return {
                list: Data.Order
            };
        },
        template: "#tp-resume"
    });

    App = new Vue({
        el: "#app",
        data: {
            version: "0.0.0"
        }
    });
}

window.addEventListener("load", start);
