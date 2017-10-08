$(function(){
	$('.tabs').each(function(i){
		console.log(i);
		$(this).click(function(){
//			$(this).css("color","#f27427").siblings().css("color","#737373");
			switch (i){
				case 0:
					$('.user_info').css('display','block');
					$('.publish').css('display','none');
					break;
				case 1:
					$('.user_info').css('display','none');
					$('.publish').css('display','block');
					break;
				default:
					break;
			}
		})
	})
//	$('.file').click(function(){
//		alert(1)
//	})
	$(".file").on("change","input[type='file']",function(){
    var filePath=$(this).val();
    if(filePath.indexOf("jpg")!=-1 || filePath.indexOf("png")!=-1){
//      $(".fileerrorTip").html("").hide();
        var arr=filePath.split('\\');
        var fileName=arr[arr.length-1];
        console.log(fileName)
        $(".url").attr('src',fileName);
    }else{
        $(".showFileName").html("");
        $(".fileerrorTip").html("您未上传文件，或者您上传文件类型有误！").show();
        return false 
    }
})
})
