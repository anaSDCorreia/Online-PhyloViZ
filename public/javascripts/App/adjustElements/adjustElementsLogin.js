fontsize = function () {

    var ButtonSubmitfontSize = $("#sign").width() * 0.015; // 10% of container width
    var ButtonfontSize = $("#sign").width() * 0.015; // 10% of container width
    var titleFontSize = $("#sign").width() * 0.03; // 10% of container width

    $("body").css('font-size', ButtonfontSize);
    $("#userLocation").css('font-size', ButtonfontSize * 1.1);
    $(".resizable_button_submit").css('font-size', ButtonSubmitfontSize);
    $("#uploadDiv").css('font-size', ButtonfontSize);
    $("#divMessage").css('font-size', ButtonfontSize);
    $("#status").css('font-size', ButtonfontSize);
    $(".title").css('font-size', titleFontSize);

    $("body").css('opacity', 1);
};

$(window).resize(fontsize);
$(document).ready(fontsize);