function TimestampToDate(timestamp){
    var d = new Date(timestamp*1000);
    return new Date(d.getTime() + d.getTimezoneOffset()*60*1000);
}
Date.prototype.format = function(f){
    if (!this.strings){
        this.strings = {};
        for(var k in Date.formatStrings){
            var o = Date.formatStrings[k];
            var val;
            if (o[0] instanceof Function){
                val = o[0](this);
            }else{
                val = this[o[0]]();
            }
            if (o.length >= 3) val += o[2];
            if (o.length >= 2) val = val.pad(o[1]);

            this.strings[k] = val;
        }
    }

    for(var k in Date.formatStrings){
        f = f.replace(k, this.strings[k]);
    }

    return f;
};

Date.formatStrings = {
    d: ['getDate', 2],
    j: ['getDate'],
    m: ['getMonth',2,1],
    Y: ['getFullYear',4],
    H: ['getHours',2],
    h: [function(d){return d.getHours() - (d.getHours() > 12 ? 12 : 0)},2],
    i: ['getMinutes',2],
    s: ['getSeconds',2],
    A: [function(d){return (d.getHours() > 12 ? "PM" : "AM")},2]
};

/**
 *
 * @param dateField
 * @param timeField
 * @returns {Date}
 */
Date.fromInputDate = function(dateField, timeField){
    var day = 0, month = 0, year = 0, hour = 0, minute = 0;

    if (dateField){
        dateField = $(dateField).val();
        if (dateField){
            dateField = dateField.split('-');
            year = parseInt(dateField[0]);
            month = parseInt(dateField[1])-1;
            day = parseInt(dateField[2]);
        }
    }

    if (timeField){
        timeField = $(timeField).val();
        if (timeField){
            timeField = timeField.split(':');
            hour = parseInt(timeField[0]);
            minute = parseInt(timeField[1]);
        }
    }

    return new Date(year, month, day, hour, minute, 0, 0);
}

Date.prototype.stdTimezoneOffset = function() {
    var fy=this.getFullYear();
    if (!Date.prototype.stdTimezoneOffset.cache.hasOwnProperty(fy)) {

        var maxOffset = new Date(fy, 0, 1).getTimezoneOffset();
        var monthsTestOrder=[6,7,5,8,4,9,3,10,2,11,1];

        for(var mi=0;mi<12;mi++) {
            var offset=new Date(fy, monthsTestOrder[mi], 1).getTimezoneOffset();
            if (offset!=maxOffset) {
                maxOffset=Math.max(maxOffset,offset);
                break;
            }
        }
        Date.prototype.stdTimezoneOffset.cache[fy]=maxOffset;
    }
    return Date.prototype.stdTimezoneOffset.cache[fy];
};

Date.prototype.stdTimezoneOffset.cache={};

Date.prototype.isDST = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};