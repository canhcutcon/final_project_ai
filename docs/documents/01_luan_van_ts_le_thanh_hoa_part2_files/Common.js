//====================================================================
//	LibolCommon.js
//	Functions is sorted by function name

//	*Note: After repair or add new functions
//	Everybody need write 2 commends with contents:
//	- Name of repairer or owner of new functions.	  
//	- Date.
//=====================================================================
// Declare variables
var popUp;
var iebrower = document.all;

// Trim Data Input

$(document).ready(function () { $("input").blur(function () { $(this).val($.trim($(this).val())); }); });

//=====================================================================
// Menu process
// Creator: Tuannn
//
//=====================================================================

// Menu Change function
// Purpose: Display again the button images when click to other menu
function MenuChange() {
    if (document.forms[0].hidClick.value != 0) {
        var intTemp1;
        var intTemp2;
        intTemp1 = parseFloat(document.forms[0].hidClick.value);
        intTemp2 = parseFloat(document.forms[0].hidClick.value) + 1;
        eval('menu' + document.forms[0].hidClick.value).style.backgroundImage = 'url(../App_Themes/Images/002_bg.gif)';
        if (document.forms[0].hidClick.value == 1) {
            eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_002.gif)';
            eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
        }
        else if (document.forms[0].hidClick.value == document.forms[0].hidMaxMenu.value) {
            eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
            eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_004.gif)';
        }
        else {
            eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
            eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
        }
    }
}

// MenuClick
// Purpose: Change the color of the new menu and keep them until other click event handled
function MenuClick(intMenu) {
    if (intMenu != 0) {
        document.forms[0].hidClick.value = intMenu;

        var intTemp1;
        var intTemp2;

        intTemp1 = intMenu;
        intTemp2 = parseFloat(intMenu) + 1;

        eval('menu' + intTemp1).style.backgroundImage = 'url(../App_Themes/Images/002_bg_b.gif)';
        if (intMenu == 1) {
            eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_002_b.gif)';
            eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_c.gif)';
        }
        else if (document.forms[0].hidClick.value == document.forms[0].hidMaxMenu.value) {
            eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
            eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_004_b.gif)';

        }
        else {
            eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
            eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_c.gif)';
        }
    }
}

// MenuHover 
// Purpose: Change the color of the button hovered (The click button not have to change)
function MenuHover(intMenu) {
    if (intMenu != 0 && intMenu != document.forms[0].hidClick) {
        var intTemp1;
        var intTemp2;

        intTemp1 = intMenu;
        intTemp2 = parseFloat(intMenu) + 1;

        eval('menu' + intTemp1).style.backgroundImage = 'url(../App_Themes/Images/002_bg_b.gif)';
        if (intMenu == 1) {
            if (intMenu == parseFloat(document.forms[0].hidClick.value) - 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_002_b.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_d.gif)';
            }
            else {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_002_b.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_c.gif)';
            }
        }
        else if (intMenu == document.forms[0].hidMaxMenu.value) {
            if (intMenu == parseFloat(document.forms[0].hidClick.value) + 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_d.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_004_b.gif)';
            }
            else {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_004_b.gif)';
            }
        }
        else {
            if (intMenu == parseFloat(document.forms[0].hidClick.value) - 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_d.gif)';
            }
            else if (intMenu == parseFloat(document.forms[0].hidClick.value) + 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_d.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_c.gif)';
            }
            else {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_c.gif)';
            }
        }
    }
}

// MenuOut
// Purpose: Clear the color of the button (Change for the UnClick button)
function MenuOut(intMenu) {
    if (document.forms[0].hidClick.value != intMenu) {
        var intTemp1;
        var intTemp2;

        intTemp1 = intMenu;
        intTemp2 = parseFloat(intMenu) + 1;

        eval('menu' + intTemp1).style.backgroundImage = 'url(../App_Themes/Images/002_bg.gif)';
        if (intMenu == 1) {
            if (intMenu == parseFloat(document.forms[0].hidClick.value) - 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_002.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
            }
            else {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_002.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
            }
        }
        else if (intMenu == document.forms[0].hidMaxMenu.value) {
            if (intMenu == parseFloat(document.forms[0].hidClick.value) - 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_004.gif)';
            }
            else {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_004.gif)';
            }

        }
        else {
            if (intMenu == parseFloat(document.forms[0].hidClick.value) + 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_c.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
            }
            else if (intMenu == parseFloat(document.forms[0].hidClick.value) - 1) {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003_b.gif)';
            }
            else {
                eval('menu' + intTemp1 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
                eval('menu' + intTemp2 + 'a').style.backgroundImage = 'url(../App_Themes/Images/002_003.gif)';
            }
        }
    }
}

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}

function CheckDate(objDateField, strDateFormat, strMsg) {
    //Check Date of dateobjects.
    //User:NVK
    //Date:29/8/2003
    strDateFormat = strDateFormat.toLowerCase();
    //objDateField.value = objDateField.value.trim;
    mdateval = eval(objDateField).value;
    mdateval = mdateval.toString().trim(); //replace(/^\s+|\s+$/g,"")
    switch (strDateFormat) {
        case 'dd/mm/yyyy':
            if (mdateval != "") {
                mday = mdateval.substring(0, mdateval.indexOf("/"));
                mmonth = mdateval.substring(mdateval.indexOf("/") + 1, mdateval.lastIndexOf("/"));
                myear = mdateval.substring(mdateval.lastIndexOf("/") + 1, mdateval.length);
                mdate = new Date(mmonth + "/" + mday + "/" + myear);
                cday = mdate.getDate();
                cmonth = mdate.getMonth() + 1;
                cyear = mdate.getYear();
                if ((parseFloat(mday) != parseFloat(cday)) || (parseFloat(mmonth) != parseFloat(cmonth)) || (isNaN(myear)) || (myear.length < 4) || (myear.length > 4) || (myear < 1753)) {
                    alert(strMsg);
                    eval(objDateField).value = "";
                    eval(objDateField).focus();
                    return false;
                }
                break;
            }
        case 'mm/dd/yyyy':
            if (mdateval != "") {
                mmonth = mdateval.substring(0, mdateval.indexOf("/"));
                mday = mdateval.substring(mdateval.indexOf("/") + 1, mdateval.lastIndexOf("/"))
                myear = mdateval.substring(mdateval.lastIndexOf("/") + 1, mdateval.length);
                mdate = new Date(mmonth + "/" + mday + "/" + myear);
                cday = mdate.getDate();
                cmonth = mdate.getMonth() + 1;
                cyear = mdate.getYear();
                if (parseFloat(mday) != parseFloat(cday) || parseFloat(mmonth) != parseFloat(cmonth) || (myear != cyear) || (myear.length != 4) || (myear < 1753)) {
                    alert(strMsg);
                    eval(objDateField).value = "";
                    eval(objDateField).focus();
                    return false;
                }
                break;
            }
    }
    return true;
}

/* Check value is empty
if obj's value is null return true 
else return false
*/
function CheckNull(obj) {
    var strValue;
    strValue = trim(eval(obj).value);
    if (strValue == "") {
        return true;
    }
}

// Created date: 29/10/2003
// Last modified date: 29/10/2003
// Purpose: Tao Popupwindow
// Input: 
//		- Url: dia chi trang			[string]
//		- Winname: ten cua so			[string]
//		- wWidth: do rong cua cua so	[number]
//		- wHeigth: chieu cao cua co so	[number]
//		- wTop:							[number]
//		- wLeft:						[number]
//		- wScrollbar:('yes','no')		[string]
//		- strOthers: cac tham so khac (chu y cac tham so cach nhau bang dau ";")
//				  menubar,status,resizable,center
//		- Modal: (1:dung ShowModal; 0: dung open) [number]
// Creator: vantd
function openModal(Url, Winname, wWidth, wHeight, wLeft, wTop, wScrollbar, strOthers, Modal) {
    if (Modal == 1) {
        // read name browser
        if (navigator.appName.toLowerCase().indexOf('microsoft internet explorer') >= 0 || navigator.appName.toLowerCase().indexOf('internet explorer') >= 0) {
            // IE Browser
            if (strOthers.length > 0)
                strOthers = ';' + strOthers;
            if (wScrollbar.toLowerCase() == 'no')
                strOthers = strOthers + ';scroll=no';
            if (Url.indexOf("?") >= 0)
                Url = Url + "&modal=1";
            else
                Url = Url + "?modal=1";
            dialogWindow = window.showModalDialog(Url, top, 'dialogWidth=' + wWidth + 'px;dialogHeight=' + wHeight + 'px' + ';dialogLeft=' + wLeft + ';dialogTop=' + wTop + strOthers);
        } else {
            // Any other browsers 
            if (Url.indexOf("?") >= 0)
                Url = Url + "&modal=0";
            else
                Url = Url + "?modal=0";
            if (strOthers.length > 0) {
                strOthers.replace(';', ',');
                strOthers = ',' + strOthers;
            }
            if (wScrollbar.toLowerCase() == 'no')
                strOthers = strOthers + ',scrollbars=no';
            else
                strOthers = strOthers + ',scrollbars=yes';
            dialogWindow = window.open(Url, Winname, 'height=' + wHeight + ',width=' + wWidth + ',screenX=' + wLeft + ',screenY=' + wTop + strOthers);
        }
    } else {
        if (Url.indexOf("?") >= 0)
            Url = Url + "&modal=0";
        else
            Url = Url + "?modal=0";
        if (strOthers.length > 0) {
            strOthers = strOthers.replace(';', ',');
            strOthers = ',' + strOthers;
        }
        if (wScrollbar.toLowerCase() == 'no')
            strOthers = strOthers + ',scrollbars=no';
        else
            strOthers = strOthers + ',scrollbars=yes';
        dialogWindow = window.open(Url, Winname, 'height=' + wHeight + ',width=' + wWidth + ',top=' + wTop + ',left=' + wLeft + ',screenX=' + wLeft + ',screenY=' + wTop + strOthers);
    }
}

// Open Window 
// By: 
// Modified: kiemdv
// Date: 30/8/2003
function OpenWindow(strUrl, strWinname, intWidth, intHeight) {
    var sParameter = "width=" + intWidth + ",height=" + intHeight + ",left=100,top=150,menubar=no,resizable=yes,scrollbars=yes"
    popUp = window.open(strUrl, "Calendar", sParameter);
    popUp.focus();
    return false;
}

// Open Window Calendar
// By: 
// Modified: kiemdv
// Date: 30/8/2003
function OpenWindowCalendar(strUrl) {
    popUp = window.open(strUrl, "Calendar", "width=255,height=220,left=200,top=250,menubar=no,resizable=no,scrollbars=no");
    popUp.focus()
}

// Created date: 29/10/2003
// Last modified date: 29/10/2003
// Purpose: Tao Popupwindow
// Input: 
//		- Url: dia chi trang			[string]
//		- Winname: ten cua so			[string]
//		- wWidth: do rong cua cua so	[number]
//		- wHeigth: chieu cao cua co so	[number]
//		- wTop:							[number]
//		- wLeft:						[number]
//		- wScrollbar:('yes','no')		[string]
//		- strOthers: cac tham so khac (chu y cac tham so cach nhau bang dau ";")
//				  menubar,status,resizable,center
//		- Modal: (1:dung ShowModal; 0: dung open) [number]
// Creator: vantd
function openModal(Url, Winname, wWidth, wHeight, wLeft, wTop, wScrollbar, strOthers, Modal) {
    if (Modal == 1) {
        // read name browser
        if (navigator.appName.toLowerCase().indexOf('microsoft internet explorer') >= 0 || navigator.appName.toLowerCase().indexOf('internet explorer') >= 0) {
            // IE Browser
            if (strOthers.length > 0)
                strOthers = ';' + strOthers;
            if (wScrollbar.toLowerCase() == 'no')
                strOthers = strOthers + ';scroll=no';
            if (Url.indexOf("?") >= 0)
                Url = Url + "&modal=1";
            else
                Url = Url + "?modal=1";
            dialogWindow = window.showModalDialog(Url, top, 'dialogWidth=' + wWidth + 'px;dialogHeight=' + wHeight + 'px' + ';dialogLeft=' + wLeft + ';dialogTop=' + wTop + strOthers);
        } else {
            // Any other browsers 
            if (Url.indexOf("?") >= 0)
                Url = Url + "&modal=0";
            else
                Url = Url + "?modal=0";
            if (strOthers.length > 0) {
                strOthers.replace(';', ',');
                strOthers = ',' + strOthers;
            }
            if (wScrollbar.toLowerCase() == 'no')
                strOthers = strOthers + ',scrollbars=no';
            else
                strOthers = strOthers + ',scrollbars=yes';
            dialogWindow = window.open(Url, Winname, 'height=' + wHeight + ',width=' + wWidth + ',screenX=' + wLeft + ',screenY=' + wTop + strOthers);
        }
    } else {
        if (Url.indexOf("?") >= 0)
            Url = Url + "&modal=0";
        else
            Url = Url + "?modal=0";
        if (strOthers.length > 0) {
            strOthers = strOthers.replace(';', ',');
            strOthers = ',' + strOthers;
        }
        if (wScrollbar.toLowerCase() == 'no')
            strOthers = strOthers + ',scrollbars=no';
        else
            strOthers = strOthers + ',scrollbars=yes';
        dialogWindow = window.open(Url, Winname, 'height=' + wHeight + ',width=' + wWidth + ',top=' + wTop + ',left=' + wLeft + ',screenX=' + wLeft + ',screenY=' + wTop + strOthers);
    }
}

// CreaLted date: 30/10/2003
// Last modified date: 30/10/2003
// Purpose: dat lai doi tuong opener
// Creator: vantd
function setOpener() {
    if (self.location.href.toLowerCase().indexOf("modal=1") >= 0) {
        opener = window.dialogArguments;
    }
}

// Creator: Kiemdv
// Hoan doi mau nen cho mot object, co the la mot dong trong Datagrid
function swapBG(btn, BG2) {
    if (iebrower) {
        tmp = btn.parentElement.parentElement.style.backgroundColor;
        if (BG2 != tmp)
            BG1 = btn.parentElement.parentElement.style.backgroundColor;
        btn.parentElement.parentElement.style.backgroundColor = (btn.parentElement.parentElement.style.backgroundColor == BG2) ? BG1 : BG2;
    }
}

function SetBG(obj, BG) {
    obj.parentElement.parentElement.style.backgroundColor = BG;
}

// CreaLted date: 26/12/2003
// Purpose: call printer
// Creator: sondp
function Print() {
    self.focus();
    setTimeout('self.print()', 1);
}

//COPY from libolcommon 5.5
function Esc(inval, utf) {
    inval = escape(inval);
    if (utf == 0) {
        return inval;
    }
    outval = "";
    while (inval.length > 0) {
        p = inval.indexOf("%");
        if (p >= 0) {
            if (inval.charAt(p + 1) == "u") {
                outval = outval + inval.substring(0, p) + JStoURLEncode(eval("0x" + inval.substring(p + 2, p + 6)));
                inval = inval.substring(p + 6, inval.length);
            } else {
                outval = outval + inval.substring(0, p) + JStoURLEncode(eval("0x" + inval.substring(p + 1, p + 3)));
                inval = inval.substring(p + 3, inval.length);
            }
        } else {
            outval = outval + inval;
            inval = "";
        }
    }
    return outval;
}
function JStoURLEncode(c) {
    if (c < 0x80) {
        return Hexamize(c);
    } else if (c < 0x800) {
        return Hexamize(0xC0 | c >> 6) + Hexamize(0x80 | c & 0x3F);
    } else if (c < 0x10000) {
        return Hexamize(0xE0 | c >> 12) + Hexamize(0x80 | c >> 6 & 0x3F) + Hexamize(0x80 | c & 0x3F);
    } else if (c < 0x200000) {
        return Hexamize(0xF0 | c >> 18) + Hexamize(0x80 | c >> 12 & 0x3F) + Hexamize(0x80 | c >> 6 & 0x3F) + Hexamize(0x80 | c & 0x3F);
    } else {
        return '?'		// Invalid character
    }
}

function Hexamize(n) {
    hexstr = "0123456789ABCDEF";
    return "%" + hexstr.charAt(parseInt(n / 16)) + hexstr.charAt(n % 16);
}


function setPgb(pgbID, pgbValue) {
    if (pgbObj = document.getElementById(pgbID))
        pgbObj.width = pgbValue + '%'; // increase the progression by changing the width of the table
    if (lblObj = document.getElementById(pgbID + '_label'))
        lblObj.innerHTML = pgbValue + '%'; // change the label value
}

//add by lent
//06/07/2007
function BackPage() {
    top.history.back();
}
//add by lent
//06/07/2007
function ForwardPage() {
    top.history.forward();
}

function RemValue(Item, Loc) {
    Item = Item + ',';
    Str = eval(Loc).value;
    if (Str.indexOf(Item) != -1) {
        Str = Str.replace(Item, '')
    }
    eval(Loc).value = Str;
}

function ClearForm(objForm) {
    var elements = objForm.elements;
    //objForm.reset();
    for (i = 0; i < elements.length; i++) {
        field_type = elements[i].type.toLowerCase();

        switch (field_type) {
            case "text":
            case "password":
            case "textarea":
            case "hidden":
                elements[i].value = "";
                break;
            case "radio":
            case "checkbox":
                if (elements[i].checked) {
                    elements[i].checked = false;
                }
                break;
            case "select-one":
                elements[i].selectedIndex = 0;
                break;
            case "select-multi":
                elements[i].selectedIndex = -1;
                break;
            case "select-multiple":
                elements[i].selectedIndex = -1;
                break;
            default:
                break;
        }
    }
    return false;
}

// Event: datagrid all checkbox onclick
// Input: all checkbox id, item checkbox id
function CheckAllItem(allItemID, itemID) {
    var form = document.forms[0];
    for (i = 0; i < form.elements.length; i++) {
        if (form.elements[i].type == "checkbox" && form.elements[i].name.lastIndexOf(itemID) != -1) {
            form.elements[i].checked = document.getElementById(allItemID).checked;
        }
    }
}

// Event: datagrid item checkbox onclick
// Input: all checkbox id, item checkbox object is check, item checkbox id
function CheckItem(objChk, allItemID, itemID) {
    if (!objChk.checked) {
        document.getElementById(allItemID).checked = false;
    }
    else {
        var form = document.forms[0];
        document.getElementById(allItemID).checked = true;
        for (i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox" && form.elements[i].name.lastIndexOf(itemID) != -1) {
                if (!form.elements[i].checked) {
                    document.getElementById(allItemID).checked = false;
                    break;
                }
            }
        }
    }
}

// Confirm the delete (YES = Do action, NO = Cancel)
function ConfirmDelete(msg) {
    var truthBeTold = window.confirm(msg);
    if (truthBeTold) {
        return true;
    } else {
        return false;
    }
}

// Purpose: check if any checkbox item of datagrid is check
// Input: itemid, msg1 to inform no item is checkec, msg2 to confirm delete
function AnyItemIsChecked(itemID, msg1, msg2) {
    var form = document.forms[0];
    var ret = 0;
    for (i = 0; i < form.elements.length; i++) {
        if (form.elements[i].type == "checkbox" && form.elements[i].name.lastIndexOf(itemID) != -1) {
            if (form.elements[i].checked) {
                ret = 1;
                break;
            }
        }
    }
    if (ret == 0) {
        alert(msg1);
        return false;
    }
    else if (msg2 != '') {
        return window.confirm(msg2);
    }
}

// Finished by Congnt


var iCountItemSelected = 0;
var iTotalCheckbox = 0;

function SelectAllCheckboxes(objChk) {

    // Added as ASPX uses SPAN for checkbox
    var oItem = objChk.children;
    var oTotal = 0;

    var theBox = (objChk.type == "checkbox") ? objChk : objChk.children.item[0];
    xState = theBox.checked;
    elm = theBox.form.elements;

    //Tinh tong so checkbox
    for (i = 0; i < elm.length; i++) {
        if (elm[i].type == "checkbox" && elm[i].id != theBox.id) {
            oTotal++;
        }
        iTotalCheckbox = oTotal;
    }

    for (i = 0; i < elm.length; i++) {
        if (elm[i].type == "checkbox" && elm[i].id != theBox.id) {

            if (elm[i].checked != xState) {
                elm[i].click();
            }
        }
    }

    if (iCountItemSelected < 0)
        iCountItemSelected = 0;
}

function CounTotalCheckBox(objChk) {
    // Added as ASPX uses SPAN for checkbox
    var oItem = objChk.children;

    var theBox = (objChk.type == "checkbox") ? objChk : objChk.children.item[0];
    elm = theBox.form.elements;

    //Tinh tong so checkbox
    for (i = 0; i < elm.length; i++) {
        if (elm[i].type == "checkbox" && elm[i].id != theBox.id) {
            iTotalCheckbox++;
        }
    }
}

//Su kien check cua tung checkbox va kiem tra cho checkall
function SelectItemCheckboxes(objChk, objChkAll) {
    if (objChk.checked == true) {
        iCountItemSelected = iCountItemSelected + 1;
        if (iTotalCheckbox == 0)
            CounTotalCheckBox(objChkAll)
        if (iCountItemSelected == iTotalCheckbox)
            objChkAll.checked = true;
        else
            objChkAll.checked = false;
    }
    else {
        iCountItemSelected = iCountItemSelected - 1;
        objChkAll.checked = false;
    }

    if (iCountItemSelected < 0) {
        iCountItemSelected = 0;
    }
}



/// Kiem tra do dai cua textbox multi
/// linhnm      25/05/2011      create
function checkLengthTextBoxMulti(NameofControl, MaxLength) {
    var txtDescription = document.getElementById(NameofControl);

    if (txtDescription.value.length > MaxLength) {
        txtDescription.value = txtDescription.value.substring(0, MaxLength);
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da lua chon ban ghi can xoa chua
// LinhNM       15/06/2011      Create
function Confirm2Delete(strMessage) {
    if (iCountItemSelected <= 0) {
        alert("Yêu cầu chọn bản ghi cần xóa.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da lua chon ban ghi can xoa chua
// LinhNM       15/06/2011      Create
function ConfirmToRemoved(strMessage) {
    if (iCountItemSelected <= 0) {
        alert("Yêu cầu chọn trường tin cần loại bỏ khỏi khung biên mục.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da lua chon ban ghi can gop chua
// kiennv       15/06/2011      Create
function ConfirmToDelete(strMessage) {
    if (iCountItemSelected <= 0) {
        alert("Yêu cầu chọn khung biên mục cần gộp.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da Chon truogn tin chua?
// kiennv       15/06/2011      Create
function ConfirmToDeleteSelect(strMessage) {
    if (iCountItemSelected <= 0) {
        alert("Yêu cầu chọn trường tin cần thêm vào khung biên mục.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// View Alert Requie Grid
// CanTV       06/08/2012      Create
function Confirm2Delete_Alert(strMessage) {
    if (iCountItemSelected <= 0) {
        alert(strMessage);
        return false;
    }

    return true;
}

// Confirm Xoa ban ghi da chon
// CanTV       15/06/2011      Create
function Confirm2DeleteOnlyRow(strMessage) {
    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da lua chon ban ghi can xoa chua kieu la combobox
// lelinh       08/06/2012      Create
function ConfirmDeleteCombox(strMessage, iId) {
    if (iId <= 0) {
        alert("Yêu cầu chọn mẫu báo cáo cần xóa.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}


// Confirm co kiem tra xem da lua chon ban ghi can xoa chua
// LinhNM       15/06/2011      Create
function Confirm2Sync(strMessage) {
    if (iCountItemSelected <= 0) {
        alert("Yêu cầu chọn bản ghi cần đồng bộ.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da lua chon ban ghi can xoa chua
// LinhNM       15/06/2011      Create
function Confirm2Order(strMessage) {
    if (iCountItemSelected <= 0) {
        alert("Yêu cầu chọn bản ghi cần xếp.");
        return false;
    }

    if (confirm(strMessage) == true) {
        return true;
    } else {
        return false;
    }
    return true;
}

// Confirm co kiem tra xem da lua chon ban ghi can thuc hien
// LinhNM       15/06/2011      Create
function Confirm2Action(strAction, bolMessage, strMessage) {
    if (iCountItemSelected <= 0) {
        alert(strAction);
        return false;
    }

    if (bolMessage == true) {
        if (confirm(strMessage) == true) {
            return true;
        } else {
            return false;
        }
    }
    return true;
}

/// Kiểm tra định dạng tệp tin upload
/// linhnm      25/05/2011      create
function CheckFileType(obj, fileType, sMessage) {
    var re = /\..+$/;
    var ext = obj.match(re);
    if (hash[ext] == false) {
        alert(sMessage);
        obj.value = '';
    }
    return false;
}

//Kiennv
//date: 23/05/2011
//reload page
function reloadPage() {
    __doPostBack("lnkReloadPage", '');
}

//Kiennv
//Date: 25/05/2011
//Su ly mau ke hoach
//Get information when onchange ddl
function UsePlanInfo(textEl, source) {
    var text;
    text = source.options[source.selectedIndex].value;
    if (typeof (textEl.caretPos) != "undefined" && textEl.createTextRange) {
        var caretPos = textEl.caretPos;
        caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
        caretPos.select();
    } else {
        textEl.value = text;
    }
    //textEl.caretPos = caretPos + text.length;	
    textEl.focus(textEl.value.length - 1);
}

// Description: Add giá trị field source vào textEl
// (Chức năng tương tự function UsePlanInfo)
// Changes: tự động bổ sung cặp thẻ <$giá_trị_trường$>
// Use: Dùng cho hành động chọn trường giá trị khi cập nhật mẫu biểu
// HuyNK        14/06/2011
function AddValueToInputTextControl(textEl, source) {
    var txtListItemValue;
    txtListItemValue = source.options[source.selectedIndex].value;
    if (typeof (textEl.caretPos) != "undefined" && textEl.createTextRange) {
        var caretPos = textEl.caretPos;
        if (caretPos.text.charAt(caretPos.text.length - 1) == ' ')
            caretPos.text = '<$' + txtListItemValue + '$> ';
        else
            caretPos.text = '<$' + txtListItemValue + '$>';
        caretPos.select();
    }
    else { textEl.value = '<$' + txtListItemValue + '$>'; }
    textEl.focus(textEl.value.length - 1);
}

//Kiennv
//Date: 25/05/2011
//Su ly gia tri dua vao phan noi dung ke hoach
function storeCaret(textEl) {
    if (textEl.createTextRange) {
        textEl.caretPos = document.selection.createRange();
    }
}



// Started by LinhNM - 5/12/2010
// Transfer items from a listbox to another listbox
function TransferLstItems2Object(fromLst, toLst, all, obj, bolAddRemove) {

    fromLst = document.getElementById(fromLst);
    toLst = document.getElementById(toLst);
    obj = document.getElementById(obj);


    if (all == true) {
        for (i = 0; i < fromLst.length; i++) {
            toLst.length++;
            toLst.options[(toLst.length) - 1].value = fromLst.options[i].value;
            toLst.options[(toLst.length) - 1].text = fromLst.options[i].text;
            if (bolAddRemove == true) {
                eval(obj).value += toLst.options[(toLst.length) - 1].value + ',';
            }
        }
        for (i = fromLst.length - 1; i >= 0; i--) {
            fromLst.remove(i);
        }
        if (bolAddRemove == false) {
            eval(obj).value = '';
        }
    }
    else {
        var k = 0;
        var i;
        for (i = 0; i < fromLst.length; i++) {

            if (fromLst.options[i].selected) {
                toLst.length++;
                toLst.options[(toLst.length) - 1].value = fromLst.options[i].value;
                toLst.options[(toLst.length) - 1].text = fromLst.options[i].text;

                if (bolAddRemove == false) {
                    RemValue(toLst.options[(toLst.length) - 1].value, obj);
                } else {
                    eval(obj).value += toLst.options[(toLst.length) - 1].value + ',';
                }
            }
            else {
                fromLst.options[k].value = fromLst.options[i].value;
                fromLst.options[k].text = fromLst.options[i].text;
                fromLst.options[k].selected = false;
                k = k + 1;

            }
        }
        fromLst.length = k;
    }

    return false;
}

function RemValue(Item, Loc) {
    Item = Item + ',';
    Str = eval(Loc).value;
    if (Str.indexOf(Item) != -1) {
        Str = Str.replace(Item, '')
    }
    eval(Loc).value = Str;
}

//Kiennv
//Date: 25/05/2011
//EncryptionTags
function EncryptionTags() {
    //Title
    document.forms[0].txtTenMauKeHoach.value = xreplace(document.forms[0].txtTenMauKeHoach.value, '<', '&lt;');
    document.forms[0].txtTenMauKeHoach.value = xreplace(document.forms[0].txtTenMauKeHoach.value, '>', '&gt;');
    //Content
    document.forms[0].txtNoiDung.value = xreplace(document.forms[0].txtNoiDung.value, '<', '&lt;');
    document.forms[0].txtNoiDung.value = xreplace(document.forms[0].txtNoiDung.value, '>', '&gt;');
}


//Kiennv
//Date: 25/05/2011
//DecryptionTags
function DecryptionTags(title, content) {
    //Title
    title = xreplace(title, '&lt;', '<');
    title = xreplace(title, '&gt;', '>');
    //Content
    content = xreplace(content, '&lt;', '<');
    content = xreplace(content, '&gt;', '>');
}

//Kiennv
//Date: 25/05/2011
//Replace
function xreplace(inputString, fromString, toString) {
    var temp = inputString;
    var i = temp.indexOf(fromString);
    while (i > -1) {
        temp = temp.replace(fromString, toString);
        i = temp.indexOf(fromString, i + toString.length + 1);
    }
    return temp;
}

//Preview Template
//Kiennv     26/05/2011    Create
function Preview() {
    PreviewWin = window.open('wpKeHoach_MauBieu_Xem.aspx', 'PreviewWin', 'height=350,width=600,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = 'wpKeHoach_MauBieu_Xem.aspx';
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    //    document.forms[0].action = 'wpKeHoach_MauBieu.aspx';
    //    document.forms[0].target = self.name;
    PreviewWin.focus();
}


//Preview Template
//Kiennv     29/05/2011    Create
function PreviewMauBieu() {
    PreviewWin = window.open('wpMauBieu_Xem.aspx', 'PreviewWin', 'height=350,width=600,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = 'wpMauBieu_Xem.aspx';
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    //    document.forms[0].action = 'wpMauBieu.aspx';
    //    document.forms[0].target = self.name;
    PreviewWin.focus();
}

// Preview mẫu biểu
// Tương tự function PreviewMauBieu, nhưng có thêm 1 tham số: target url
// HuyNK        15/06/2011      Create
function PreviewThisForm(sTargetUrl) {
    PreviewWin = window.open(sTargetUrl, 'PreviewWin', 'height=400,width=750,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = sTargetUrl;
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    //    document.forms[0].target = self.name;
    PreviewWin.focus();
}

//ViewPrint Template
//Kiennv     27/05/2011    Create
function ViewPrint(url) {
    PreviewWin = window.open(url + '&FormID=' + document.getElementById('ddlChonMauKeHoach').options[document.getElementById('ddlChonMauKeHoach').selectedIndex].value, 'PreviewWin', 'height=350,width=600,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = ;
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    PreviewWin.focus();
}


//ViewPrintMauPhieu Template
//Kiennv     27/05/2011    Create
function ViewPrintPhieuDiVu(url) {
    PreviewWin = window.open(url + '&FormID=' + document.getElementById('ddlChonMauPhieu').options[document.getElementById('ddlChonMauPhieu').selectedIndex].value, 'PreviewWin', 'height=350,width=600,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = url + '&FormID=' + document.getElementById('ddlChonMauPhieu').options[document.getElementById('ddlChonMauPhieu').selectedIndex].value;
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    PreviewWin.focus();
}

//ViewPrintMauBaoCao Template
//Kiennv     27/05/2011    Create
function ViewPrintMauBaoCao(url) {
    PreviewWin = window.open(url + '&FormID=' + document.getElementById('ddlChonMauBaoCao').options[document.getElementById('ddlChonMauBaoCao').selectedIndex].value, 'PreviewWin', 'height=350,width=600,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = url + '&FormID=' + document.getElementById('ddlChonMauBaoCao').options[document.getElementById('ddlChonMauBaoCao').selectedIndex].value;
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    PreviewWin.focus();
}

//ViewPrint Template
//Kiennv     27/05/2011    Create
function ViewPrintKeHoach(url) {
    PreviewWin = window.open(url, 'PreviewWin', 'height=350,width=600,resizable,menubar=no,scrollbars=yes,screenX=0,screenY=0,top=10,left=10');
    //    document.forms[0].action = url;
    //    document.forms[0].method = 'post';
    //    document.forms[0].target = 'PreviewWin';
    //    document.forms[0].submit();
    PreviewWin.focus();
}

//var msg = "Hệ thống không cho phép sử dụng chuột phải. Xin vui lòng liên hệ quản trị hệ thống.";
//function disableIE() {
//    if (document.all) { alert(msg); return false; }
//}
//function disableNS(e) {
//    if (document.layers || (document.getElementById && !document.all)) {
//        if (e.which == 2 || e.which == 3) { alert(msg); return false; }
//    }
//}
//if (document.layers) {
//    document.captureEvents(Event.MOUSEDOWN); document.onmousedown = disableNS;
//} else {
//    document.onmouseup = disableNS; document.oncontextmenu = disableIE;
//}
//document.oncontextmenu = new Function("alert(msg);return false")


$(document).load(function () {
    var vWidth = $(document).width();
    var vHeight = $(document).height();
    $('.lbgrid-overflow-container').css('width', vWidth - 50);
    $('.popup-overflow-container').css('width', vWidth);
});

$(document).resize(function () {
    var vWidth = $(document).width();
    var vHeight = $(document).height();
    $('.lbgrid-overflow-container').css('width', vWidth - 50);
    $('.popup-overflow-container').css('width', vWidth);
});

function OnPopup(sPageName, iHeight, iWidth) {
    tb_show('', sPageName + "&TB_iframe=true;height=" + iHeight + ";width=" + iWidth + ";", '');
    return false;
}

function funOpenDictionary(iType, obj) {
    OpenDictionary(iType, obj);
}

function registerCalendar() {
    $('.datepicker').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy',
        startDate: new Date('01/01/1900'),
        endDate: new Date('12/31/9999'),
        keyboardNavigation: false
    });
}

///Thông báo Maxlength đối với control Texbox kiểu Multiline
function CheckMaxLength(textBox, maxLength) {
    if (textBox.value.length > maxLength) {
        alert("Chỉ được phép nhập tối đa " + maxLength + " kí tự.");
        textBox.value = textBox.value.substr(0, maxLength);
    }
}

//====================================================================
//	LibolCommon.js
//	Functions is sorted by function name

//	*Note: After repair or add new functions
//	Everybody need write 2 commends with contents:
//	- Name of repairer or owner of new functions.	  
//	- Date.
//=====================================================================
// Declare variables
var popUp;
//
//=====================================================================
//
//	Used to add new item for SelectBox, DropDownList.
function AddItem(obj, texts, val) {
    eval(obj).length++;
    eval(obj).options[eval(obj).options.length - 1].value = val;
    eval(obj).options[eval(obj).options.length - 1].text = texts;
    eval(obj).options[eval(obj).options.length - 1].selected = true;
    self.close();
}

//Trim string in javascript.
//Creater: Tuanhv
//Date: 30/10/2004
function trim(str) {
    return str.replace(/^\s*|\s*$/g, "");
}

// Creator: Kiemdv
// Date 11/9/2003
// Add item for dropdownlist and mark add data by javascript for dropdownlist
// By set value for objtxt 
function AddItemPatron(objddl, texts, val, objtxt) {
    eval(objddl).length++;
    eval(objddl).options[eval(objddl).options.length - 1].value = val;
    eval(objddl).options[eval(objddl).options.length - 1].text = texts;
    eval(objddl).options[eval(objddl).options.length - 1].selectedIndex = eval(objddl).length;
    eval(objddl).options[eval(objddl).options.length - 1].selected = true;
    eval(objtxt).value = eval(objddl).length - 1;
    if (eval(objddl).name == 'ddlCollege') {
        opener.document.forms[0].ddlFaculty.length = 1;
    }
    self.close();
}

// Load data to dropdownlist and textbox
function AddDdlItem(objddl, text, val, objtxt) {
    eval(objddl).length++;
    eval(objddl).options[eval(objddl).options.length - 1].value = val;
    eval(objddl).options[eval(objddl).options.length - 1].text = text;
    eval(objddl).options[eval(objddl).options.length - 1].selectedIndex = eval(objddl).length;
    eval(objddl).options[eval(objddl).options.length - 1].selected = true;
    eval(objtxt).value = eval(objddl).length - 1;
    self.close();
}

// Used to remove item for SelectBox, DropDownList.
function RemoveItem(obj) {
    eval(obj).length++;
    eval(obj).options[eval(obj).options.length - 1].value = val;
    eval(obj).options[eval(obj).options.length - 1].text = texts;
}

function CheckDate(objDateField, strDateFormat, strMsg) {
    //Check Date of dateobjects.
    //User:NVK
    //Date:29/8/2003
    strDateFormat = strDateFormat.toLowerCase();
    mdateval = eval(objDateField).value;
    switch (strDateFormat) {
        case 'dd/mm/yyyy':
            if (mdateval != "") {
                mday = mdateval.substring(0, mdateval.indexOf("/"));
                mmonth = mdateval.substring(mdateval.indexOf("/") + 1, mdateval.lastIndexOf("/"));
                myear = mdateval.substring(mdateval.lastIndexOf("/") + 1, mdateval.length);
                mdate = new Date(mmonth + "/" + mday + "/" + myear);
                cday = mdate.getDate();
                cmonth = mdate.getMonth() + 1;
                cyear = mdate.getYear();
                if ((parseFloat(mday) != parseFloat(cday)) || (parseFloat(mmonth) != parseFloat(cmonth)) || (isNaN(myear)) || (myear.length < 4) || (myear.length > 4) || (myear < 1753)) {
                    alert(strMsg);
                    eval(objDateField).value = "";
                    eval(objDateField).focus();
                    return false;
                }
                break;
            }
        case 'mm/dd/yyyy':
            if (mdateval != "") {
                mmonth = mdateval.substring(0, mdateval.indexOf("/"));
                mday = mdateval.substring(mdateval.indexOf("/") + 1, mdateval.lastIndexOf("/"))
                myear = mdateval.substring(mdateval.lastIndexOf("/") + 1, mdateval.length);
                mdate = new Date(mmonth + "/" + mday + "/" + myear);
                cday = mdate.getDate();
                cmonth = mdate.getMonth() + 1;
                cyear = mdate.getYear();
                if (parseFloat(mday) != parseFloat(cday) || parseFloat(mmonth) != parseFloat(cmonth) || (myear != cyear) || (myear.length != 4) || (myear < 1753)) {
                    alert(strMsg);
                    eval(objDateField).value = "";
                    eval(objDateField).focus();
                    return false;
                }
                break;
            }
    }
    return true;
}
// Creator: Kiemdv
// Date 3/10/2003
// Check Email Address
function CheckValidEmail(objEmail) {
    var str = eval(objEmail).value;
    if (window.RegExp) {
        var reg1str = "(@.*@)|(\\.\\.)|(@\\.)|(\\.@)|(^\\.)";
        var reg2str = "^.+\\@(\\[?)[a-zA-Z0-9\\-\\.]+\\.([a-zA-Z]{2,3}|[0-9]{1,3})(\\]?)$";
        var reg1 = new RegExp(reg1str);
        var reg2 = new RegExp(reg2str);
        if (!reg1.test(str) && reg2.test(str)) {
            return true;
        }
        objEmail.focus();
        objEmail.select();
        return false;
    } else {
        if (str.indexOf("@") >= 0)
            return true;
        objEmail.focus();
        objEmail.select();
        return false;
    }
}

/* Check value is empty
	if obj's value is null return true 
	else return false
*/
function CheckNull(obj) {
    strValue = eval(obj).value;
    if (strValue == "") {
        eval(obj).value = '';
        eval(obj).focus();
        return true;
    }
    else {
        Status = 0;
        for (i = 0; i < strValue.length; i++) {
            if (strValue.charAt(i) != " ") {
                Status = 1;
                break;
            }
        }
        if (Status == 0) {
            return true;
        }
        else {
            eval(obj).value = '';
            eval(obj).focus();
            return false;
        }
    }
}


// Open Window 
// By: 
// Modified: kiemdv
// Date: 30/8/2003
function OpenWindow(strUrl, strWinname, intWidth, intHeight, intLeft, intTop) {
    popUp = window.open(strUrl, strWinname, "width=" + intWidth + ",height=" + intHeight + ",left=" + intLeft + ",top=" + intTop + ",menubar=yes,resizable=no,scrollbars=yes");
    popUp.focus();
}
//====================================================================
//Used to remove old item in SelectBox..
//User:DPS
//Date:30/8/2003
function RemoveItems(obj) {
    var k = 0;
    for (var i = 0; i < eval(obj).length; i++) {
        if (eval(obj).options[i].selected == true) {
            eval(obj).options[k].value = eval(obj).options[i].value;
            eval(obj).options[k].text = eval(obj).options[i].text;
            eval(obj).options[k].selected = false;
            k = k + 1;
            alert(i + '=' + k)
        }
        eval(obj).length = k;
    }
}

// Set text
//=====================================================================
// 
//	Used to add new item for SelectBox.
function SetText(texts, obj) {
    eval(obj).value = texts;
    eval(obj).focus();
    self.close();
}
//Set fous for Control Object.
//User:kiemdv
//Date:8/9/2003
function SetFocus(control) {
    control.focus();
}

//By: Tuanhv 
//Date: 12/09/2004
//Purpose: check a variable is number
function CheckNumBer(objDateField, strMsg) {
    var tempNum;
    tempNum = eval(objDateField).value;
    if ((isNaN(tempNum)) || (CheckNull(objDateField))) {
        alert(strMsg);
        eval(objDateField).value = "";
        eval(objDateField).focus();
        return false;
    }
    return true;
}

//By: Hungdp
//Date: 11/09/2003
//Purpose: check a variable is number
function CheckNum(obj) {
    var tempNum;
    tempNum = eval(obj).value;
    if ((isNaN(tempNum)) || (CheckNull(obj))) {
        eval(obj).focus();
        eval(obj).value = '';
        return false;
    } else {
        return true;
    }
}
//Generate a random number
//user: sondp+ vantd
//date: 19/9/2003
function GenRanNum(strIdlength) {
    var str;
    str = '';
    for (i = 1; i <= strIdlength; i++) {
        str = str + (String)(parseInt(9 * Math.random() + 48));
    }
    return (str);
}

function GenURL(strIdlength) {
    document.images["anh1"].src = '../WChartDir.aspx?i=1&x=' + GenRanNum(strIdlength);
    document.images["anh2"].src = '../WChartDir.aspx?i=2&x=' + GenRanNum(strIdlength);
}
// ReText function vantd 01/10/2003
function ReText(strin) {
    if (strin.length > 0) {
        strin = strin.replace('', '');
        strin = strin.replace('', '');
        strin = strin.replace('', '');
        strin = strin.replace('', '');
    }
    return strin;
}

// This function used to check (uncheck) all checkBox on form
// Created by: Oanhtn
// Created date: 3/10/2003
// Last modified date: 3/10/2003
// Input: 
//		- strDtgName: name of datagrid 
//		- strOptionName: name of checkbox
//		- intMax: number of checkboxs on this form
// Output: no
function CheckAllOption(strDtgName, strOptionName, intMax) {
    var intCounter;
    var blnStatus;
    alert(intMax);
    blnStatus = eval('document.forms[0].' + strOptionName).checked;
    if (blnStatus) {
        blnStatus = false;
    } else {
        blnStatus = true;
    }
    for (intCounter = 3; intCounter <= intMax + 2; intCounter++) {
        eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intCounter).checked = blnStatus;
    }
}

function CheckAllOptions(strDtgName, strOptionName, intStart, intMax) {
    var intCounter;
    var blnStatus;
    blnStatus = eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intStart).checked;
    if (blnStatus) {
        blnStatus = false;
    } else {
        blnStatus = true;
    }

    for (intCounter = intStart; intCounter <= intMax + intStart - 1; intCounter++) {
        eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intCounter).checked = blnStatus;
    }
}

// If find an check object, check, if not, through away

function CheckAllOptionsVisible(strDtgName, strOptionName, intStart, intMax) {
    var intCounter;
    var blnStatus;

    if (eval('document.forms[0].CheckAll').checked)
        blnStatus = true;
    else
        blnStatus = false;
    for (intCounter = intStart; intCounter <= intMax + intStart - 1; intCounter++) {
        if (eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intCounter)) {
            eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intCounter).checked = blnStatus;
        }
    }
}

// This function used to check any checkbox on this form have been selected
// Created by: Oanhtn
// Created date: 3/10/2003
// Last modified date: 3/10/2003
// Input: 
//		- strDtgName: name of datagrid 
//		- strOptionName: name of checkbox
//		- intMax: number of checkboxs on this form
// Output: Boolean value
//		- true if atlease one checkbox selected
function CheckSelectedItemsOLD(strDtgName, strOptionName, intMax) {
    var intCounter;
    var blnStatus;
    blnStatus = false;
    for (intCounter = 3; intCounter <= intMax + 2; intCounter++) {
        if (eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intCounter).checked) {
            blnStatus = true;
            break;
        }
    }
    return blnStatus;
}

function CheckSelectedItems(strDtgName, strOptionName, intStart, intMax) {
    var intCounter;
    var blnStatus;
    blnStatus = false;
    for (intCounter = intStart; intCounter <= intMax + intStart - 1; intCounter++) {
        if (eval('document.forms[0].' + strDtgName + '_' + strOptionName + '_' + intCounter).checked) {
            blnStatus = true;
            break;
        }
    }
    return blnStatus;
}

// Created date: 29/10/2003
// Last modified date: 29/10/2003
// Purpose: Tao Popupwindow
// Input: 
//		- Url: dia chi trang			[string]
//		- Winname: ten cua so			[string]
//		- wWidth: do rong cua cua so	[number]
//		- wHeigth: chieu cao cua co so	[number]
//		- wTop:							[number]
//		- wLeft:						[number]
//		- wScrollbar:('yes','no')		[string]
//		- strOthers: cac tham so khac (chu y cac tham so cach nhau bang dau ";")
//				  menubar,status,resizable,center
//		- Modal: (1:dung ShowModal; 0: dung open) [number]
// Creator: vantd
function openModal(Url, Winname, wWidth, wHeight, wLeft, wTop, wScrollbar, strOthers, Modal) {
    if (Modal == 1) {
        // read name browser
        if (navigator.appName.toLowerCase().indexOf('microsoft internet explorer') >= 0 || navigator.appName.toLowerCase().indexOf('internet explorer') >= 0) {
            // IE Browser
            if (strOthers.length > 0)
                strOthers = ';' + strOthers;
            if (wScrollbar.toLowerCase() == 'no')
                strOthers = strOthers + ';scroll=no';
            if (Url.indexOf("?") >= 0)
                Url = Url + "&modal=1";
            else
                Url = Url + "?modal=1";
            dialogWindow = window.showModalDialog(Url, top, 'dialogWidth=' + wWidth + 'px;dialogHeight=' + wHeight + 'px' + ';dialogLeft=' + wLeft + ';dialogTop=' + wTop + strOthers);
        } else {
            // Any other browsers 
            if (Url.indexOf("?") >= 0)
                Url = Url + "&modal=0";
            else
                Url = Url + "?modal=0";
            if (strOthers.length > 0) {
                strOthers.replace(';', ',');
                strOthers = ',' + strOthers;
            }
            if (wScrollbar.toLowerCase() == 'no')
                strOthers = strOthers + ',scrollbars=no';
            else
                strOthers = strOthers + ',scrollbars=yes';
            dialogWindow = window.open(Url, Winname, 'height=' + wHeight + ',width=' + wWidth + ',screenX=' + wLeft + ',screenY=' + wTop + strOthers);
        }
    } else {
        if (Url.indexOf("?") >= 0)
            Url = Url + "&modal=0";
        else
            Url = Url + "?modal=0";
        if (strOthers.length > 0) {
            strOthers = strOthers.replace(';', ',');
            strOthers = ',' + strOthers;
        }
        if (wScrollbar.toLowerCase() == 'no')
            strOthers = strOthers + ',scrollbars=no';
        else
            strOthers = strOthers + ',scrollbars=yes';
        dialogWindow = window.open(Url, Winname, 'height=' + wHeight + ',width=' + wWidth + ',top=' + wTop + ',left=' + wLeft + ',screenX=' + wLeft + ',screenY=' + wTop + strOthers);
    }
}

// CreaLted date: 30/10/2003
// Last modified date: 30/10/2003
// Purpose: dat lai doi tuong opener
// Creator: vantd
function setOpener() {
    if (self.location.href.toLowerCase().indexOf("modal=1") >= 0) {
        opener = window.dialogArguments;
    }
}
// Creator: Kiemdv
// Hoan doi mau nen cho mot object, co the la mot dong trong Datagrid
function swapBG(btn, BG2) {
    tmp = btn.parentElement.parentElement.style.backgroundColor;
    if (BG2 != tmp)
        BG1 = btn.parentElement.parentElement.style.backgroundColor;
    btn.parentElement.parentElement.style.backgroundColor = (btn.parentElement.parentElement.style.backgroundColor == BG2) ? BG1 : BG2;
}
function SetBG(obj, BG) {
    obj.parentElement.parentElement.style.backgroundColor = BG;
}

// CreaLted date: 26/12/2003
// Purpose: call printer
// Creator: sondp
function Print() {
    self.focus();
    setTimeout('self.print()', 1);
}

//COPY from libolcommon 5.5
function Esc(inval, utf) {
    inval = escape(inval);
    if (utf == 0) {
        return inval;
    }
    outval = "";
    while (inval.length > 0) {
        p = inval.indexOf("%");
        if (p >= 0) {
            if (inval.charAt(p + 1) == "u") {
                outval = outval + inval.substring(0, p) + JStoURLEncode(eval("0x" + inval.substring(p + 2, p + 6)));
                inval = inval.substring(p + 6, inval.length);
            } else {
                outval = outval + inval.substring(0, p) + JStoURLEncode(eval("0x" + inval.substring(p + 1, p + 3)));
                inval = inval.substring(p + 3, inval.length);
            }
        } else {
            outval = outval + inval;
            inval = "";
        }
    }
    return outval;
}
function JStoURLEncode(c) {
    if (c < 0x80) {
        return Hexamize(c);
    } else if (c < 0x800) {
        return Hexamize(0xC0 | c >> 6) + Hexamize(0x80 | c & 0x3F);
    } else if (c < 0x10000) {
        return Hexamize(0xE0 | c >> 12) + Hexamize(0x80 | c >> 6 & 0x3F) + Hexamize(0x80 | c & 0x3F);
    } else if (c < 0x200000) {
        return Hexamize(0xF0 | c >> 18) + Hexamize(0x80 | c >> 12 & 0x3F) + Hexamize(0x80 | c >> 6 & 0x3F) + Hexamize(0x80 | c & 0x3F);
    } else {
        return '?'		// Invalid character
    }
}

function Hexamize(n) {
    hexstr = "0123456789ABCDEF";
    return "%" + hexstr.charAt(parseInt(n / 16)) + hexstr.charAt(n % 16);
}


function setPgb(pgbID, pgbValue) {
    if (pgbObj = document.getElementById(pgbID))
        pgbObj.width = pgbValue + '%'; // increase the progression by changing the width of the table
    if (lblObj = document.getElementById(pgbID + '_label'))
        lblObj.innerHTML = pgbValue + '%'; // change the label value
}
// add by lent: these function support to loading searched
function GetValueField(objField, strParameter) {
    var str = strParameter + "=";
    var strId = jQuery("." + objField).attr("id");
    if (eval("document.forms[0]." + strId)) {
        if (eval("document.forms[0]." + strId).value != "")
            str = str + replaceSubstring(eval("document.forms[0]." + strId).value, '&', '^');
    }
    str = str + "&";
    return str;
}
function GetValueFieldAdvance(intid) {
    var str = "";
    var idSelected = 0;
    var intPrefix = 1;
    if (intid != "5") {
        var ddlPrefixId = jQuery(".ddlPrefix" + intid).attr("id");
        var txtFieldValueId = jQuery(".txtFieldValue" + intid).attr("id");
        var ddlFieldNameId = jQuery(".ddlFieldName" + intid).attr("id");
        var ddlOperatorId = jQuery(".ddlOperator" + intid).attr("id");

        if (eval("document.forms[0]." + ddlPrefixId)) {
            intPrefix = eval("document.forms[0]." + ddlPrefixId).selectedIndex;
        }
        if (eval("document.forms[0]." + txtFieldValueId).value != "") {
            idSelected = eval("document.forms[0]." + ddlFieldNameId).selectedIndex;
            str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").value + "&";
            switch (intPrefix) {
                case 0:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=%" + eval("document.forms[0]." + txtFieldValueId).value + "%&";
                    break;
                case 1:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=" + eval("document.forms[0]." + txtFieldValueId).value + "&";
                    break;
                case 2:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=" + eval("document.forms[0]." + txtFieldValueId).value + "%&";
                    break;
                case 3:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=%" + eval("document.forms[0]." + txtFieldValueId).value + "&";
                    break;
                case 4:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=>=" + eval("document.forms[0]." + txtFieldValueId).value + "&";
                    break;
                case 5:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=<=" + eval("document.forms[0]." + txtFieldValueId).value + "&";
                    break;
                case 6:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=>=" + eval("document.forms[0]." + txtFieldValueId).value + "&";
                    break;
                case 7:
                    str = str + eval("document.forms[0]." + ddlFieldNameId + ".options[" + idSelected + "]").text + "=<=" + eval("document.forms[0]." + txtFieldValueId).value + "&";
                    break;
            }
            if (intid == "1") str = str + "AND&";
            else {
                idSelected = eval("document.forms[0]." + ddlOperatorId).selectedIndex;
                str = str + eval("document.forms[0]." + ddlOperatorId + ".options[" + idSelected + "]").value + "&";
            }
        }
    }
    else {
        var ddlFormatId = jQuery(".ddlFormat").attr("id");

        if (document.forms[0].ddlFormat.selectedIndex > 0) {
            str = str + "ItemType&ItemType=" + eval("document.forms[0]." + ddlFormatId).options[eval("document.forms[0]." + ddlFormatId).selectedIndex].value + "&AND&";
        }
    }
    return str;
}

function SetArrSearchedSymbol(ContentType, ItemType, FieldName, FieldValue, SortBy, Display, SelectTop) {
    var strtemp = "Content=" + ContentType + "&";
    var intCount = 0;
    var strtmp = "";

    strtemp = strtemp + "ItemType=" + ItemType + "&";
    strtemp = strtemp + "SearchMode=single&";

    if (FieldName == 'Author') {
        strtemp = strtemp + "DDC_BBK=&";
        strtemp = strtemp + "UDC=&";
        strtemp = strtemp + "NSC=&";
        strtemp = strtemp + "KeyWord=&";
        strtemp = strtemp + "SubjectHeading=&";
    }
    else if (FieldName == 'DDC_BBK') {
        strtemp = strtemp + "Author=&";
        strtemp = strtemp + "UDC=&";
        strtemp = strtemp + "NSC=&";
        strtemp = strtemp + "KeyWord=&";
        strtemp = strtemp + "SubjectHeading=&";
    }
    else if (FieldName == 'UDC') {
        strtemp = strtemp + "DDC_BBK=&";
        strtemp = strtemp + "Author=&";
        strtemp = strtemp + "NSC=&";
        strtemp = strtemp + "KeyWord=&";
        strtemp = strtemp + "SubjectHeading=&";
    }
    else if (FieldName == 'NSC') {
        strtemp = strtemp + "DDC_BBK=&";
        strtemp = strtemp + "UDC=&";
        strtemp = strtemp + "Author=&";
        strtemp = strtemp + "KeyWord=&";
        strtemp = strtemp + "SubjectHeading=&";
    }
    else if (FieldName == 'KeyWord') {
        strtemp = strtemp + "DDC_BBK=&";
        strtemp = strtemp + "UDC=&";
        strtemp = strtemp + "NSC=&";
        strtemp = strtemp + "Author=&";
        strtemp = strtemp + "SubjectHeading=&";
    }
    else if (FieldName == 'SubjectHeading') {
        strtemp = strtemp + "KeyWord=&";
        strtemp = strtemp + "DDC_BBK=&";
        strtemp = strtemp + "UDC=&";
        strtemp = strtemp + "NSC=&";
        strtemp = strtemp + "Author=&";
    }

    strtemp = strtemp + FieldName + "=" + FieldValue + "&";
    strtemp = strtemp + "SortBy=" + SortBy + "&";
    strtemp = strtemp + "SelectTop=" + SelectTop + "&";
    strtemp = strtemp + "Display=" + Display;

    var txtArrSearchedId = parent.HiddenSaveIDs.jQuery(".txtArrSearched").attr("Id");
    alert(txtArrSearchedId);

    if (parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value != "")
        parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value = parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value + "|" + strtemp;
    else
        parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value = strtemp;

    parent.HiddenSaveIDs.document.forms[0].submit();
}

function SetArrSearched(ContentType, ItemType, SearchMode) {
    var strtemp = "Content=" + ContentType + "&";
    var intCount = 0;
    var strtmp = "";

    switch (SearchMode.toLowerCase()) {
        case "detail":
            strtemp = strtemp + "ItemType=" + ItemType + "&";
            strtemp = strtemp + "SearchMode=" + SearchMode + "&";
            strtemp = strtemp + GetValueField("txtTitle", "Title");
            strtemp = strtemp + GetValueField("txtAuthor", "Author");
            strtemp = strtemp + GetValueField("txtIndexDDC", "DDC_BBK");
            strtemp = strtemp + GetValueField("txtPublisher", "Publisher");
            strtemp = strtemp + GetValueField("txtLanguage", "Language");
            strtemp = strtemp + GetValueField("txtKeyWord", "KeyWord");
            strtemp = strtemp + GetValueField("txtPubYear", "PublishYear");
            strtemp = strtemp + GetValueField("txtSpeciality", "ThesisSubject");
            strtemp = strtemp + GetValueField("txtHeightFrom", "MinHeigthImage");
            strtemp = strtemp + GetValueField("txtHeightTo", "MaxHeigthImage");
            strtemp = strtemp + GetValueField("txtWidthFrom", "MinWidthImage");
            strtemp = strtemp + GetValueField("txtWidthTo", "MaxWidthImage");
            strtemp = strtemp + GetValueField("txtMaxSizeFrom", "MinSizeImage");
            strtemp = strtemp + GetValueField("txtMaxSizeTo", "MaxSizeImage");
            strtemp = strtemp + GetValueField("txtMaxResFrom", "MinResImage");
            strtemp = strtemp + GetValueField("txtMaxResTo", "MaxResImage");
            strtemp = strtemp + GetValueField("txtList", "TabOfContents");
            strtemp = strtemp + GetValueField("txtIssue", "IssueNo");
            strtemp = strtemp + GetValueField("txtVolumn", "Vol");
            strtemp = strtemp + GetValueField("txtFromDate", "FromEdeliveryDate");
            strtemp = strtemp + GetValueField("txtToDate", "ToEdeliveryDate");
            strtemp = strtemp + GetValueField("txtISBN", "ISBN");
            strtemp = strtemp + GetValueField("txtISSN", "ISSN");

            strtemp = strtemp + "BitmapType=";
            if (eval('document.forms[0].ddlColor'))
                if (document.forms[0].ddlColor.selectedIndex > 0)
                    strtemp = strtemp + document.forms[0].ddlColor.options[document.forms[0].ddlColor.selectedIndex].value;
            strtemp = strtemp + "&";

            strtemp = strtemp + "ColorMode="
            if (eval('document.forms[0].ddlTypeColor'))
                if (document.forms[0].ddlTypeColor.selectedIndex > 0)
                    strtemp = strtemp + document.forms[0].ddlTypeColor.options[document.forms[0].ddlTypeColor.selectedIndex].value;
            strtemp = strtemp + "&";

            strtemp = strtemp + "SortBy=";
            var strSortId = jQuery("." + ddlSort).attr("id");
            if (eval("document.forms[0]." + strSortId))
                if (eval("document.forms[0]." + strSortId).selectedIndex > 0)
                    strtemp = strtemp + eval("document.forms[0]." + strSortId).options[eval("document.forms[0]." + strSortId).selectedIndex].value;
            strtemp = strtemp + "&";

            if (eval('document.forms[0].ddlLimit')) {
                if (document.forms[0].ddlLimit.selectedIndex > 0)
                    strtemp = strtemp + "SelectTop=" + document.forms[0].ddlLimit.options[document.forms[0].ddlLimit.selectedIndex].value + "&";
                else
                    strtemp = strtemp + "SelectTop=1000&";
            }
            break;
        case "advance":
            intCount = 0;
            strtmp = GetValueFieldAdvance("1");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtmp = GetValueFieldAdvance("2");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtmp = GetValueFieldAdvance("3");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtmp = GetValueFieldAdvance("4");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }

            strtmp = GetValueFieldAdvance("5");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtemp = "adv&" + intCount + "&" + strtemp;
            strtemp = strtemp + "SortBy=";
            var strSortId = jQuery("." + ddlSort).attr("id");
            if (eval("document.forms[0]." + strSortId))
                if (eval("document.forms[0]." + strSortId).selectedIndex > 0)
                    strtemp = strtemp + eval("document.forms[0]." + strSortId).options[eval("document.forms[0]." + strSortId).selectedIndex].value;
            strtemp = strtemp + "&";
            break;
        case "z3950":
            intCount = 0;
            strtemp = strtemp + GetValueField("txtzServer", "Host");
            strtemp = strtemp + GetValueField("txtZPort", "Port");
            strtemp = strtemp + GetValueField("txtZDatabase", "Database");

            var chkVietUSMARCId = jQuery(".chkVietUSMARC").attr("Id");
            if (eval('document.forms[0].' + chkVietUSMARCId).checked)
                strtemp = strtemp + "VietUSMARC=True&";
            else
                strtemp = strtemp + "VietUSMARC=False&";

            strtmp = GetValueFieldAdvance("1");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtmp = GetValueFieldAdvance("2");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtmp = GetValueFieldAdvance("3");
            if (strtmp != "") {
                intCount = intCount + 1;
                strtemp = strtemp + strtmp;
            }
            strtemp = "z3950&" + intCount + "&" + strtemp;
            break;
        case "fulltext":
            strtemp = "fulltext&" + strtemp + GetValueField("txtSearch", "Keyword");
            break;
    }

    //process drop down list		
    if (eval('document.forms[0].optISBD')) {
        if (eval('document.forms[0].optISBD').checked) {
            strtemp = strtemp + "Display=ISBD";
        }
        else {
            if (eval('document.forms[0].optSimple').checked)
                strtemp = strtemp + "Display=Simple";
            else
                strtemp = strtemp + "Display=MARC";
        }
    }
    ///////////////////////////////////////////////////////////////////	
    if (parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value != "")
        parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value = parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value + "|" + strtemp;
    else parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value = strtemp;
    //alert(parent.HiddenSaveIDs.document.forms[0].txtArrSearched.value);	
    parent.HiddenSaveIDs.document.forms[0].submit();
}
function SetOnSimpleAdvance(SearchMode) {
    var content = "";
    var ItemType = "";
    content = document.forms[0].ddlFormat.options[document.forms[0].ddlFormat.selectedIndex].text;
    if (document.forms[0].ddlFormat.selectedIndex > 0)
        ItemType = document.forms[0].ddlFormat.options[document.forms[0].ddlFormat.selectedIndex].value;
    SetArrSearched(content, ItemType, SearchMode);
}

function replaceSubstring(inputString, fromString, toString) {
    // Goes through the inputString and replaces every occurrence of fromString with toString
    temp = inputString;
    if (fromString == "") {
        return (inputString);
    }
    if (toString.indexOf(fromString) == -1) {// If the string being replaced is not a part of the replacement string (normal situation)
        while (temp.indexOf(fromString) != -1) {
            var toTheLeft = temp.substring(0, temp.indexOf(fromString));
            var toTheRight = temp.substring(temp.indexOf(fromString) + fromString.length, temp.length);
            temp = toTheLeft + toString + toTheRight;
        }
    } else {// String being replaced is part of replacement string (like "+" being replaced with "++") - prevent aninfinite loop
        var midStrings = Array("~", "`", "_", "^", "#");
        var midStringLen = 1;
        var midString = "";// Find a string that doesn't exist in the inputString to be usedas an "inbetween" string
        while (midString == "") {
            for (var i = 0; i < midStrings.length; i++) {
                var tempMidString = "";
                for (var j = 0; j < midStringLen; j++) {
                    tempMidString += midStrings[i];
                }
                if (fromString.indexOf(tempMidString) == -1) {
                    midString = tempMidString;
                    i = midStrings.length + 1;
                }
            }
        }
        // Keep on going until we build an "inbetween" string that doesn't exist
        // Now go through and do two replaces - first, replace the "fromString" with the "inbetween" string
        while (temp.indexOf(fromString) != -1) {
            var toTheLeft = temp.substring(0, temp.indexOf(fromString));
            var toTheRight = temp.substring(temp.indexOf(fromString) + fromString.length, temp.length);
            temp = toTheLeft + midString + toTheRight;
        }
        // Next, replace the "inbetween" string with the "toString"
        while (temp.indexOf(midString) != -1) {
            var toTheLeft = temp.substring(0, temp.indexOf(midString));
            var toTheRight = temp.substring(temp.indexOf(midString) + midString.length, temp.length);
            temp = toTheLeft + toString + toTheRight;
        }
    }
    // Ends the check to see if the string being replaced is part of the replacement string or not
    return temp;
    // Send the updated string back to the user
}
/*
	CompareDate function
*/
function CompareDate(mdateval1, mdateval2, strDateFormat) {
    //Compare date. 
    //User:Tuanhv
    //Date:28/04/2005
    //Return false if objDateField1 > objDateField2 else return true
    strDateFormat = strDateFormat.toLowerCase();
    switch (strDateFormat) {
        case 'dd/mm/yyyy':
            if (mdateval1 != "") {
                mday = mdateval1.substring(0, mdateval1.indexOf("/"));
                mmonth = mdateval1.substring(mdateval1.indexOf("/") + 1, mdateval1.lastIndexOf("/"));
                myear = mdateval1.substring(mdateval1.lastIndexOf("/") + 1, mdateval1.length);
                mdate1 = new Date(mmonth + "/" + mday + "/" + myear);

                mday = mdateval2.substring(0, mdateval2.indexOf("/"));
                mmonth = mdateval2.substring(mdateval2.indexOf("/") + 1, mdateval2.lastIndexOf("/"));
                myear = mdateval2.substring(mdateval2.lastIndexOf("/") + 1, mdateval2.length);
                mdate2 = new Date(mmonth + "/" + mday + "/" + myear);
                if (mdate1.getTime() > mdate2.getTime()) {
                    return 0;
                }
                else {
                    if (mdate1.getTime() == mdate2.getTime()) return 2;
                }
            }
            break;
        case 'mm/dd/yyyy':
            if (mdateval1 != "") {
                mmonth = mdateval1.substring(0, mdateval1.indexOf("/"));
                mday = mdateval1.substring(mdateval1.indexOf("/") + 1, mdateval1.lastIndexOf("/"));
                myear = mdateval1.substring(mdateval1.lastIndexOf("/") + 1, mdateval1.length);
                mdate1 = new Date(mmonth + "/" + mday + "/" + myear);

                mmonth = mdateval2.substring(0, mdateval2.indexOf("/"));
                mday = mdateval2.substring(mdateval2.indexOf("/") + 1, mdateval2.lastIndexOf("/"));
                myear = mdateval2.substring(mdateval2.lastIndexOf("/") + 1, mdateval2.length);
                mdate2 = new Date(mmonth + "/" + mday + "/" + myear);
                if (mdate1.getTime() > mdate2.getTime()) {
                    return 0;
                }
                else {
                    if (mdate1.getTime() == mdate2.getTime()) return 2;
                }

            }
            break;
    }
    return 1;
}
