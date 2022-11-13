function on_recap_checked(e) {
    $("#submit-button").prop("disabled", false);
    $("#download-button").prop("disabled", false);
}
$(function (){
    var g_expires = 365;
    var recaptcha_js = "https://www.recaptcha.net/recaptcha/api.js";

    function clear_file() {
	var new_file = $("#file").clone();
	new_file.change(clear_url);
	$("#file").replaceWith(new_file);
    }
    function clear_url() {
	$("#url").val("")
    }
    function on_change_style(e) {
	var checked = $("input[name=style]:checked");
	if (checked.val() == "art") {
	    $(".main-title").text("waifu2x");
	} else {
	    $(".main-title").html("w<s>/a/</s>ifu2x");
	}
	$.cookie("style", checked.val(), {expires: g_expires});
    }
    function on_change_noise_level(e)
    {
	var checked = $("input[name=noise]:checked");
	$.cookie("noise", checked.val(), {expires: g_expires});
    }
    function on_change_scale_factor(e)
    {
	var checked = $("input[name=scale]:checked");
	$.cookie("scale", checked.val(), {expires: g_expires});
    }
    function commit_recap_response()
    {
	if (typeof grecaptcha != "undefined") {
	    console.log("recaptcha: enabled")
	    $("#recap_response").val(grecaptcha.getResponse());
	    grecaptcha.reset();
	    $("#submit-button").prop("disabled", true);
	    $("#download-button").prop("disabled", true);
	} else {
	    console.log("recaptcha: disabled")
	}
    }
    function restore_from_cookie()
    {
	if ($.cookie("style")) {
	    $("input[name=style]").filter("[value=" + $.cookie("style") + "]").prop("checked", true);
	}
	if ($.cookie("noise")) {
	    $("input[name=noise]").filter("[value=" + $.cookie("noise") + "]").prop("checked", true);
	}
	if ($.cookie("scale")) {
	    $("input[name=scale]").filter("[value=" + $.cookie("scale") + "]").prop("checked", true);
	}
	if ($.cookie("tta_level")) {
	    $("input[name=tta_level]").filter("[value=" + $.cookie("tta_level") + "]").prop("checked", true);
	}
    }
    function uuid() 
    {
	// ref: http://stackoverflow.com/a/2117523
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
    }
    function download_with_xhr(e) 
    {
	if (typeof window.URL.createObjectURL == "undefined" ||
	    typeof window.Blob == "undefined" ||
	    typeof window.XMLHttpRequest == "undefined" ||
	    typeof window.URL.revokeObjectURL == "undefined")
	{
	    return;
	}
	$("input[name=download]").attr("disabled", "disabled");
	e.preventDefault();
	e.stopPropagation();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/api', true);
	xhr.responseType = 'arraybuffer';
	xhr.onload= function(e) {
	    if (this.status == 200) {
		var blob = new Blob([this.response], {type : 'image/png'});
		var a = document.createElement("a");
		var url = URL.createObjectURL(blob);
		a.href = url;
		a.target = "_blank";
		a.download = uuid() + ".png";
		a.click();
		URL.revokeObjectURL(url);
		$("input[name=download]").removeAttr("disabled");
	    } else {
		alert("Download Error");
		$("input[name=download]").removeAttr("disabled");
	    }
	};
	commit_recap_response();
	xhr.send(new FormData($("form").get(0)));
    }
    function load_recaptcha()
    {
        $("#submit-button").prop("disabled", true);
        $("#download-button").prop("disabled", true);
	$.ajax({
	    url: "/recaptcha_state.json",
	    type: "GET",
	    dataType: "json",
	}).done(function (data) {
	    if (data.enabled) {
		// setup recaptcha
		console.log("recaptcha is enabled");
		// <div class="g-recaptcha" data-sitekey="6LfcWBYUAAAAAC7IdcoiUPmiILomcSJ8Bg7jPlxn" data-callback="on_recap_checked"></div>
		$("<div>").attr({
		    "class": "g-recaptcha",
                    "data-sitekey": data.site_key,
                    "data-callback": "on_recap_checked"
		}).appendTo("#recap_container");
		$("<script>").attr({
		    type: "text/javascript",
		    src: recaptcha_js
		}).appendTo(document.head);
	    } else {
		console.log("recaptcha is disabled");
	    }
            $("#submit-button").prop("disabled", false);
            $("#download-button").prop("disabled", false);
	}).fail(function (e) {
	    console.log(e)
	});
    }
    function set_param()
    {
	var uri = URI(window.location.href);
	var url = uri.query(true)["url"];
	var style = uri.query(true)["style"];
	var noise = uri.query(true)["noise"];
	var scale = uri.query(true)["scale"];
	if (url) {
	    $("input[name=url]").val(url);
	}
	if (style) {
	    $("input[name=style]").filter("[value=" + style + "]").prop("checked", true);
	}
	if (noise) {
	    $("input[name=noise]").filter("[value=" + noise + "]").prop("checked", true);
	}
	if (scale) {
	    $("input[name=scale]").filter("[value=" + scale + "]").prop("checked", true);
	}
    }
    $("#url").change(clear_file);
    $("#file").change(clear_url);
    $("input[name=style]").change(on_change_style);
    $("input[name=noise]").change(on_change_noise_level);
    $("input[name=scale]").change(on_change_scale_factor);
    $("input[name=download]").click(download_with_xhr);
    $("form").submit(function(e) {
	e.preventDefault();
	commit_recap_response();
	this.submit();
    });
    restore_from_cookie();
    on_change_style();
    on_change_scale_factor();
    on_change_noise_level();
    set_param();
    load_recaptcha();
})