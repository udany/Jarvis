function showDialog(id, title, text, value){
    document.title = title;
    $(".title-text").html(title);
    $(".text").html(text);
    remote.getCurrentWindow().show();

    $("#input").val(value).on('keypress', function(e){
        if (e.which === 13){
            if (MainCall("prompt-reply", {id: id, reply: $(this).val()})){
                remote.getCurrentWindow().close();
            }
        }
    }).focus();
}

