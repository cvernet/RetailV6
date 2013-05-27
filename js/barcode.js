
var ean13_array = new Array('aaaaaa', 'aababb', 'aabbab', 'aabbba', 'abaabb', 'abbaab', 'abbbaa', 'ababab', 'ababba', 'abbaba');
var ean13_2_array = new Array('aa', 'ab', 'ba', 'bb');
var ean13_5_array = new Array('bbaaa', 'babaa', 'baaba', 'baaab', 'abbaa', 'aabba', 'aaabb', 'ababa', 'abaab', 'aabab');

function bar(name)
{
	return '<div class="' + name + '"></div>';
}

function digit(digit_type, value)
{
	if (digit_type == ' ') { digit_type = '_'; }
	
	return bar(digit_type + " _" + value);
}

function get_ean13(s)
{
	var i;
	var result;

	var codeArray = ean13_array[parseInt(s.charAt(0))];

	result = digit(' ', s.charAt(0));
	result += bar('bound');

	for(i = 1; i <= 6; i++)
	{
		result += digit(codeArray.charAt(i-1), s.charAt(i));
	}

	result += bar('mid');

	for(i = 7; i <= 12; i++)
	{
		result += digit('c', s.charAt(i));
	}

	result += bar('bound');

	return result;
}

function get_ean13_2(s)
{
	var result;

	var codeArray = ean13_2_array[parseInt(s) % 4];

	result = bar('xbound');
	
	result += digit(codeArray.charAt(0), s.charAt(0));
	result += bar('xmid');
	result += digit(codeArray.charAt(1), s.charAt(1));
	
	return result;
}

function get_ean13_5(s)
{
	var i;
	var result;
	var checksum;

	checksum = 9 * (parseInt(s.charAt(1)) + parseInt(s.charAt(3)))
		+ 3 * (parseInt(s.charAt(0)) + parseInt(s.charAt(2)) + parseInt(s.charAt(4)));

	checksum %= 10;

	var codeArray = ean13_5_array[checksum];

	result = bar('xbound');
	
	result += digit(codeArray.charAt(0), s.charAt(0));
	for(i=1; i <= 4; i++)
	{
		result += bar('xmid');
		result += digit(codeArray.charAt(i), s.charAt(i));
	}

	return result;
}

function get_ean8(s) 
{
	var i = 0;
	var result = '';

	result += bar('bound');

	for(i = 0; i <= 3; i++)
	{
		result += digit('a', s.charAt(i));
	}

	result += bar('mid');

	for(i = 4; i <= 7; i++)
	{
		result += digit('c', s.charAt(i));
	}

	result += bar('bound');
	return result;
}

function isValidChecksum(s)
{
	var i, checksum;
	var actual = parseInt(s.charAt(s.length-1));

	checksum=0;
	for(i=s.length-2; i >= 0; i--)
	{
		if ((s.length + i) % 2 == 0)
		{
			checksum += 3 * parseInt(s.charAt(i));
		}
		else
		{
			checksum += parseInt(s.charAt(i));
		}
	}

	checksum %= 10;
	checksum = (10 - checksum) % 10;

	return (actual == checksum);
}

function warning(s)
{
//	document.getElementById('warning').innerHTML = s;
}

function process(div, s) 
{
	var regex=new RegExp('^[0-9]+$','');
	
	if (!regex.test(s))
	{
		document.getElementById(div).innerHTML = '';
		warning('Error: EAN barcode can only be composed of digits!');
		return false;
	}

	warning('');

	switch (s.length) 
	{
		case 8:
			document.getElementById(div).innerHTML = get_ean8(s);
			if (!isValidChecksum(s))
			{
				warning('Warning: barcode number "' + s + '" has invalid checksum!');
			}
			break;
		case 13:
			document.getElementById(div).innerHTML = get_ean13(s);
			if (!isValidChecksum(s))
			{
				warning('Warning: barcode number "' + s + '" has invalid checksum!');
			}
			break;
		case (13+2):
			var s1 = s.substring(0, 13);
			var s2 = s.substring(13, 15);
			document.getElementById(div).innerHTML = get_ean13(s1) + bar('space') + get_ean13_2(s2);
			if (!isValidChecksum(s1))
			{
				warning('Warning: barcode number "' + s + '" has invalid checksum!');
			}
			break;
		case (13+5):
			var s1 = s.substring(0, 13);
			var s2 = s.substring(13, 18);
			document.getElementById(div).innerHTML = get_ean13(s1) + bar('space') + get_ean13_5(s2);
			if (!isValidChecksum(s1))
			{
				warning('Warning: barcode number "' + s + '" has invalid checksum!');
			}
			break;
		default:
			document.getElementById(div).innerHTML = '';
			warning('Error: Invalid number of digits!\nYou must enter 8, 13, 15 or 18 digits.');
			return false;
	}

	return true;
}

function check_input(div, id)
{
//Modif CVER
//	var content = document.getElementById(id).value;
var content = '' + id + ''; 

	switch (content.length)
	{
		case 8:
		case 13:
		case (13+2):
		case (13+5):
			process(div, content);
			break;
		default:
			document.getElementById(div).innerHTML = '';
			warning('Error: Invalid number of digits!\nYou must enter 8, 13, 15 or 18 digits.');
			break;
	}
}
