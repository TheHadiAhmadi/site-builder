import Handlebars from 'handlebars';
import moment from 'moment';

Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Handlebars.registerHelper('formatDate', function (date, format) {
    console.log("format", format)
    if(typeof format === 'string') {
        return moment(date).format(format);
    }
    else {
        return moment(date).format('yyyy-MM-DD')
    }
});

Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

Handlebars.registerHelper('uppercase', function (str) {
    return str.toUpperCase();
});

Handlebars.registerHelper('lowercase', function (str) {
    return str.toLowerCase();
});

Handlebars.registerHelper('times', function (n, block) {
    let accum = '';
    for (let i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});

Handlebars.registerHelper('join', function (arr, separator) {
    return arr.join(separator);
});

Handlebars.registerHelper('safeString', function (str) {
    return new Handlebars.SafeString(str);
});

Handlebars.registerHelper('default', function (value, defaultValue) {
    return value != null ? value : defaultValue;
});
