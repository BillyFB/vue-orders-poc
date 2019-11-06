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
        enumerable: true,
        get: () => this.price * this.quantity
    });
    Object.defineProperty(this, '_refProduct', {
        enumerable: false,
        value: prod
    });
}

orderEntry.prototype.toJSON = function () {
    var out = {};
    for (p in this)
        if (p[0] != "_")
            out[p] = this[p];
    return out;
}

Object.defineProperty(Data.Order, 'Total', {
    get: function () {
        var total = 0;
        if (this.length)
            this.map(e => total += e.subTotal);
        return total;
    }
});

Data.Order.Add = function (product) {
    if (!product._refOrderEntry) {
        var oe = new orderEntry(product);
        product._refOrderEntry = oe;
        this.push(oe);
    }
};

Data.Order.Remove = function (entry) {
    var pos = this.indexOf(entry);
    if (pos > -1) {
        this.splice(pos, 1);
        entry._refProduct._refOrderEntry = null;
    }
};

Data.Products.map(e => {
    Object.defineProperty(e, "_refOrderEntry", {
        enumerable: true,
        writable: true,
        configurable: true
    });
});

var App;
function start() {

    Vue.filter('currency', (value, decimals) => {
        if (!value) return '';
        value = value.toLocaleString("pt-PT", { maximumFractionDigits: decimals || 2, style: "currency", currency: "EUR" });
        return value;
    });

    Vue.component("cp-product-entry", {
        props: {
            product: Object
        },
        computed: {
            orderEntry: function () {
                return this.product._refOrderEntry;
            }
        },
        methods: {
            addItemToOrder: function (prod) {
                Data.Order.Add(prod);
            },
            removeItemFromOrder: function (entry) {
                Data.Order.Remove(entry);
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
