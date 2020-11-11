const fs = require('fs');

const photo = `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
 AAAAAAAAABkAAAAZAAAACAgICAgICAgICAgICAgIAADAIwDAAAAAAAAFABkAGUAqACoAGgAAACq
 9YYDAAEA2gAAAQEB+gEAAgA4A9sHDAAFAAoAAAcMBw4MBwwMBwcMDAwMBwcHDgcHDg4HDAwMDAw
 MDAcHBw4ODg4HDAwMDAwHDgcHBQUODgcMDAwHDAcHBw4FBQUODgcHDAwMBw4MDgUFDg4ODAwMDA
 cHBwcFDg4ODg4HDAcMBwwMDgUOAQ4BBwcHBwwMDAwHBQUFDg4HBwwHDAcMBwcOBQ4FDgcHBwcHD
 AcMDA4FDg4OCAcHBwcMBwgIDg4ODg4DAwMHBwgEAwQODg4ODgMDAwMHBAQEBAEODg4BAwMDAwgE
 BAQDAw4ODgMEBAMEAwMEBAQEAw4OBAQEAwMDIQAnBQAcAAAiHAAAAAAiIRwVISIRHBgAAAAAAAA
 AFhweGAsTEyEAAAAAACEXIRwAAAsLGAAAABMAIhohFQAAAAUTFiIAAAAXFQAVAQALBQoAAAAAFi
 IcIQEVERgTFRgAFgATAAAYAQsFEwUTGgsaAAAAAA8AAAALChwaABoACwAPGhgBCwERISIXEhoAD
 wAAFwMLCgsXIRocIQATDw8TEwsTExISHSEWCwoIBhMVHBUYGBIsHQ8LBgIKChUTEwgMEjIdCwYC
 AgQDFwscBAYGIBgIDwICAgEBHA4CBgYsLAsAAAAAAAAAAAAAAAAAAAAAwQGUAQAAAAAAAAAAAAA
 AAAAAAJoDAAGuHdkC2R/LAoUbwyT+AY4B/gGOAQxmADZAngcAANoHAAAgeQAAUBYAABIAAAAuAA
 AAzoYAABoEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsDAAAAAAAAAAAAAAYABAApABMAEAAIAF8AB
 QAAAAAAAAAvAAAAKgAAAAAAHh4zMwEBDg4ODg4ODgEBAMAfAB4aIOodGiDqHRsSIB8Z6wUPQ8kZ
 MAL8AQAALQEMAcP9Vv02AAAAAABkZAEBAGQwATABMAEwAQEBAQEBAQEBNx0DADcdAwA3HQMANx0
 DAKEDoQOhA6EDABAAAAAAAAAAEAAAAAAAAAAQABAAAAAAAAAAEAAAAAAAAAAQ4g8eAP//1v9EEO
 b/6v8uAOkP6Q5jAH0Ak//BDqwBkv9G/ycRyARjCdUBTf2z+gAIAAhN+bP+0QblCH0Eqvur+swLB
 Q0E+lH9NgBHACMA3v/W/14AaADR/+v/ngwAAJ4MAACeDAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAA
 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 AAABPRkYgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgICAgICAgICAgICAgICAgIC
 AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDEwNQJBAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 AAAAAAAAAAAAAAAAAAAAE5PUk1BTCAgICAgICAgIABWUi1PTiAgICAgACAgICAgICAgACAgICAg
 ICAAMDEwMFNUQU5EQVJEICAgICAgICAgICAAU1RBTkRBUkQgICAgICAgICAgIAABAAAAAP/////
 //////wBBU0NJSQAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC
 AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI
 CAgICAgICAgICAgICAgICAgICAgAAAAAABkAAAAAgABAAIABAAAAFI5OAACAAcABAAAADAxMDAA
 AAAADQAAAAEABAAAADIzMDABAAIAAgAAAE4AAAACAAUAAwAAAOYNAAADAAIAAgAAAFcAAAAEAAU
 AAwAAAP4NAAAFAAEAAQAAAAAAAAAGAAUAAQAAABYOAAAHAAUAAwAAAB4OAAAIAAIAAwAAADA1AA
 AQAAIAAgAAAAAAAAARAAUAAQAAADYOAAASAAIACgAAAD4OAAAdAAIACwAAAEgOAAAAAAAAJgAAA
 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
 WQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5z
 OnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJ
 kZjpEZXNjcmlwdGlvbiB4bWxuczpleGlmPSdodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLy
 c+CiAgPGV4aWY6SW1hZ2VEZXNjcmlwdGlvbj4gICAgICAgICAgPC9leGlmOkltYWdlRGVzY3Jpc
 HRpb24+CiAgPGV4aWY6TWFrZT5OSUtPTjwvZXhpZjpNYWtlPgogIDxleGlmOk1vZGVsPkNPT0xQ
 SVggUDUxMDwvZXhpZjpNb2RlbD4KICA8ZXhpZjpPcmllbnRhdGlvbj5Ub3AtbGVmdDwvZXhpZjp
 PcmllbnRhdGlvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj4zMDA8L2V4aWY6WFJlc29sdXRpb24+Ci
 AgPGV4aWY6WVJlc29sdXRpb24+MzAwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sd
 XRpb25Vbml0PlB1bGdhZGE8L2V4aWY6UmVzb2x1dGlvblVuaXQ+CiAgPGV4aWY6U29mdHdhcmU+
 Q09PTFBJWCBQNTEwICAgVjEuMDwvZXhpZjpTb2Z0d2FyZT4KICA8ZXhpZjpEYXRlVGltZT4yMDE
 zOjA5OjA3IDE0OjMxOjUyPC9leGlmOkRhdGVUaW1lPgogIDxleGlmOllDYkNyUG9zaXRpb25pbm
 c+Q28tc2l0ZWQ8L2V4aWY6WUNiQ3JQb3NpdGlvbmluZz4KICA8ZXhpZjpDb21wcmVzc2lvbj5jb
 21wcmVzacOzbiBKUEVHPC9leGlmOkNvbXByZXNzaW9uPgogIDxleGlmOlhSZXNvbHV0aW9uPjMw
 MDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj4zMDA8L2V4aWY6WVJlc29
 sdXRpb24+CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+UHVsZ2FkYTwvZXhpZjpSZXNvbHV0aW9uVW
 5pdD4KICA8ZXhpZjpFeHBvc3VyZVRpbWU+MS8xMjUgc2VnLjwvZXhpZjpFeHBvc3VyZVRpbWU+C
 iAgPGV4aWY6Rk51bWJlcj5mLzQsNDwvZXhpZjpGTnVtYmVyPgogIDxleGlmOkV4cG9zdXJlUHJv
 Z3JhbT5Qcm9ncmFtYSBub3JtYWw8L2V4aWY6RXhwb3N1cmVQcm9ncmFtPgogIDxleGlmOklTT1N
 wZWVkUmF0aW5ncz4KICAgPHJkZjpTZXE+CiAgICA8cmRmOmxpPjQwMDwvcmRmOmxpPgogICA8L3
 JkZjpTZXE+CiAgPC9leGlmOklTT1NwZWVkUmF0aW5ncz4KICA8ZXhpZjpFeGlmVmVyc2lvbj5Vb
 mtub3duIEV4aWYgVmVyc2lvbjwvZXhpZjpFeGlmVmVyc2lvbj4KICA8ZXhpZjpEYXRlVGltZU9y
 aWdpbmFsPjIwMTM6MDk6MDcgMTQ6MzE6NTI8L2V4aWY6RGF0ZVRpbWVPcmlnaW5hbD4KICA8ZXh
 pZjpEYXRlVGltZURpZ2l0aXplZD4yMDEzOjA5OjA3IDE0OjMxOjUyPC9leGlmOkRhdGVUaW1lRG
 lnaXRpemVkPgogIDxleGlmOkNvbXBvbmVudHNDb25maWd1cmF0aW9uPgogICA8cmRmOlNlcT4KI
 CAgIDxyZGY6bGk+WSBDYiBDciAtPC9yZGY6bGk+CiAgIDwvcmRmOlNlcT4KICA8L2V4aWY6Q29t
 cG9uZW50c0NvbmZpZ3VyYXRpb24+CiAgPGV4aWY6Q29tcHJlc3NlZEJpdHNQZXJQaXhlbD4gNDw
 vZXhpZjpDb21wcmVzc2VkQml0c1BlclBpeGVsPgogIDxleGlmOkV4cG9zdXJlQmlhc1ZhbHVlPj
 AsMDAgRVY8L2V4aWY6RXhwb3N1cmVCaWFzVmFsdWU+CiAgPGV4aWY6TWF4QXBlcnR1cmVWYWx1Z
 T4zLDIwIEVWIChmLzMsMCk8L2V4aWY6TWF4QXBlcnR1cmVWYWx1ZT4KICA8ZXhpZjpNZXRlcmlu
 Z01vZGU+UGF0csOzbjwvZXhpZjpNZXRlcmluZ01vZGU+CiAgPGV4aWY6TGlnaHRTb3VyY2U+RGV
 zY29ub2NpZG88L2V4aWY6TGlnaHRTb3VyY2U+CiAgPGV4aWY6Rmxhc2ggcmRmOnBhcnNlVHlwZT
 0nUmVzb3VyY2UnPgogIDwvZXhpZjpGbGFzaD4KICA8ZXhpZjpGb2NhbExlbmd0aD4yNyw2IG1tP
 C9leGlmOkZvY2FsTGVuZ3RoPgogIDxleGlmOk1ha2VyTm90ZT4yNDc3IGJ5dGVzIHVuZGVmaW5l
 ZCBkYXRhPC9leGlmOk1ha2VyTm90ZT4KICA8ZXhpZjpVc2VyQ29tbWVudD4gICAgICAgICAgICA
 gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC
 AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZXhpZ
 jpVc2VyQ29tbWVudD4KICA8ZXhpZjpGbGFzaFBpeFZlcnNpb24+Rmxhc2hQaXggVmVyc2lvbiAx
 LjA8L2V4aWY6Rmxhc2hQaXhWZXJzaW9uPgogIDxleGlmOkNvbG9yU3BhY2U+c1JWQTwvZXhpZjp
 Db2xvclNwYWNlPgogIDxleGlmOlBpeGVsWERpbWVuc2lvbj40NjA4PC9leGlmOlBpeGVsWERpbW
 Vuc2lvbj4KICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MzQ1NjwvZXhpZjpQaXhlbFlEaW1lbnNpb
 24+CiAgPGV4aWY6RmlsZVNvdXJjZT5EU0M8L2V4aWY6RmlsZVNvdXJjZT4KICA8ZXhpZjpTY2Vu
 ZVR5cGU+RGlyZWN0bHkgcGhvdG9ncmFwaGVkPC9leGlmOlNjZW5lVHlwZT4KICA8ZXhpZjpDdXN
 0b21SZW5kZXJlZD5Qcm9jZXNvIG5vcm1hbDwvZXhpZjpDdXN0b21SZW5kZXJlZD4KICA8ZXhpZj
 pFeHBvc3VyZU1vZGU+RXhwb3NpY2nDs24gYXV0b23DoXRpY2E8L2V4aWY6RXhwb3N1cmVNb2RlP
 gogIDxleGlmOldoaXRlQmFsYW5jZT5CYWxhbmNlIGRlIGJsYW5jbyBhdXRvbcOhdGljbzwvZXhp
 ZjpXaGl0ZUJhbGFuY2U+CiAgPGV4aWY6RGlnaXRhbFpvb21SYXRpbz4wLDAwPC9leGlmOkRpZ2l
 0YWxab29tUmF0aW8+CiAgPGV4aWY6Rm9jYWxMZW5ndGhJbjM1bW1GaWxtPjE1NTwvZXhpZjpGb2
 NhbExlbmd0aEluMzVtbUZpbG0+CiAgPGV4aWY6U2NlbmVDYXB0dXJlVHlwZT5Fc3TDoW5kYXI8L
 2V4aWY6U2NlbmVDYXB0dXJlVHlwZT4KICA8ZXhpZjpHYWluQ29udHJvbD5HYW5hbmNpYSBhbHRh
 IGFsdGE8L2V4aWY6R2FpbkNvbnRyb2w+CiAgPGV4aWY6Q29udHJhc3Q+Tm9ybWFsPC9leGlmOkN
 vbnRyYXN0PgogIDxleGlmOlNhdHVyYXRpb24+Tm9ybWFsPC9leGlmOlNhdHVyYXRpb24+CiAgPG
 V4aWY6U2hhcnBuZXNzPk5vcm1hbDwvZXhpZjpTaGFycG5lc3M+CiAgPGV4aWY6U3ViamVjdERpc
 3RhbmNlUmFuZ2U+RGVzY29ub2NpZG88L2V4aWY6U3ViamVjdERpc3RhbmNlUmFuZ2U+CiAgPGV4
 aWY6R1BTVmVyc2lvbklEPjUwLjUxLjQ4LjQ4PC9leGlmOkdQU1ZlcnNpb25JRD4KICA8ZXhpZjp
 JbnRlcm9wZXJhYmlsaXR5SW5kZXg+TjwvZXhpZjpJbnRlcm9wZXJhYmlsaXR5SW5kZXg+CiAgPG
 V4aWY6SW50ZXJvcGVyYWJpbGl0eVZlcnNpb24+MzgsIDUsNDkyMCwgIDA8L2V4aWY6SW50ZXJvc
 GVyYWJpbGl0eVZlcnNpb24+CiAgPGV4aWY6R1BTTG9uZ2l0dWRlUmVmPlc8L2V4aWY6R1BTTG9u
 Z2l0dWRlUmVmPgogIDxleGlmOkdQU0xvbmdpdHVkZT4gNiwgMTYsNTcwMywgIDA8L2V4aWY6R1B
 TTG9uZ2l0dWRlPgogIDxleGlmOkdQU0FsdGl0dWRlUmVmPlNlYSBsZXZlbDwvZXhpZjpHUFNBbH
 RpdHVkZVJlZj4KICA8ZXhpZjpHUFNBbHRpdHVkZT42ODAsODA8L2V4aWY6R1BTQWx0aXR1ZGU+C
 iAgPGV4aWY6R1BTVGltZVN0YW1wPjEzOjMwOjM3LDI4PC9leGlmOkdQU1RpbWVTdGFtcD4KICA8
 ZXhpZjpHUFNTYXRlbGxpdGVzPjA1PC9leGlmOkdQU1NhdGVsbGl0ZXM+CiAgPGV4aWY6R1BTSW1
 nRGlyZWN0aW9uUmVmIC8+CiAgPGV4aWY6R1BTSW1nRGlyZWN0aW9uPjAvMDwvZXhpZjpHUFNJbW
 dEaXJlY3Rpb24+CiAgPGV4aWY6R1BTTWFwRGF0dW0+V0dTLTg0ICAgPC9leGlmOkdQU01hcERhd
 HVtPgogIDxleGlmOkdQU0RhdGVTdGFtcD4yMDEzOjA5OjA3PC9leGlmOkdQU0RhdGVTdGFtcD4K
 ICA8ZXhpZjpJbnRlcm9wZXJhYmlsaXR5SW5kZXg+Ujk4PC9leGlmOkludGVyb3BlcmFiaWxpdHl
 JbmRleD4KICA8ZXhpZjpJbnRlcm9wZXJhYmlsaXR5VmVyc2lvbj4wMTAwPC9leGlmOkludGVyb3
 BlcmFiaWxpdHlWZXJzaW9uPgogPC9yZGY6RGVzY3JpcHRpb24+Cgo8L3JkZjpSREY+CjwveDp4b
 XBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+Cv/bAEMAHBMVGBURHBgWGB8dHCEpRS0pJiYpVDxA
 MkVkWGlnYlhgX258noZudZZ3X2CKu4uWo6mxs7FrhMLQwazOnq6xqv/bAEMBHR8fKSQpUS0tUap
 yYHKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/AAB
 EIAFAAUAMBIQACEQEDEQH/xAAaAAADAQEBAQAAAAAAAAAAAAAAAgMEAQUG/8QAMhAAAgECBAQDB
 gYDAAAAAAAAAQIRAAMEBRIhIjFB0RNRYRUjMnGRolRicoGh8DM0sf/EABgBAAMBAQAAAAAAAAAA
 AAAAAAABAgME/8QAGxEBAQEAAwEBAAAAAAAAAAAAAAERAiExEkH/2gAMAwEAAhEDEQA/APpKKAK
 KAKKAKKAKKA+bObYwhdF/kN5VZJn5VcZjidlN7i/SO1Z7SVsYrGXNRF2dO+gqJj6c6ze0sc2sre
 AC/lHal9VTq5hj2gi6SI3hBt/FUt5jidcPd2J56RsPpT+qSTZljV53TIO40r2rt7NMWMSVW4wU/
 CNK9vnR9UIjNsdog3uLrwr2pTm+Oke/5/kXtT2kyqdNzUu46rWi9dU3AyK44eZM1NgNYxDoIBJ8
 vSuki2rTvIiB160s7V70rbtX7g8Tw1BPkK4AbF5bj24Kmaa/ghtgs1wSUG8xEnnArO8rd8QbjSd
 /KaTOohtQuE+lJzMn9qogt07k9eVa7DW/D1XAWII281iOfTciimu1u3awoYHmTM9D5UmGZXcEiQ
 OVJU9e9ZuqtpYUfKrXLdu4nEo+lVO4q7LrxMwV7LGyrHQASFAqFy2LWkADxV+IxsR5EVKL6zrZs
 jWNW0TA3NKbmHBhVdidugqkoIiauNiT6Cri7bCrwNI5yYBoodDszFmQQOk7Ct6WFYowJQ7bjkf2
 qb004TdZ8VjsXhrjIQNM7HTE09rN74w+pkJGrTPSqxX1f0j444q4pdDyg96hi8Rr92g21GWO80Z
 2yrlvggnl8J+RqDAIGE7jaT0pAMwVhHxEUycTCdm5j1pkedZIY6T/AHat+FvlgLbkQmyxzj1pXx
 fDqtTupWGgj1FIpRrZttbUrMjbY0o2ZMSba4pFRdIETA2jyrM9kB2cTo1cINUwvpWl1AjYjY/8p
 MSNDtqEahMc9/7NBC+6ghUUcSrJHP5UqsFHFHp6GnJoBuzIIMnrWnAk3L76jtpAFHKZD4etq3AD
 oufzypgUQMwKnboAKiNtebcZ7g19TvT2i962UIJHzrfHO5dOmwbcaWUyDUr11mW2wHMEMPWs7MC
 csV4RUyTWgcBg7irWMULF2YMEb0r3MOXK9a0yYm1qUhhWLH31T3Nv94rKTvGtvWsYuP5wK04W+w
 Itqsya2YjHC54+6wI29alGvCsOTK0j6VPLDyta5RmKrAw/3r3pDkuYfh/vXvVaQ9i5j+H+9e9By
 TMCP9f7170tCmHynMbEuthg8jbxFgjrO9I+TZizljYkkz8a96Oj25jvsXHx/g3/AFr3qtjK8fZJ
 cYYFo2l1709hFuZdm1wEPZmRHxr3oXKsxCmMPB/Wu/8ANK5TfU0UgKKAKKAKKAKKA//Z`;

let buff = new Buffer.from(photo, 'base64');
fs.writeFileSync('paco.png', buff);


buff = fs.readFileSync('paco.png');
let base64data = buff.toString('base64');
console.log('Image converted to base 64 is:\n\n' + base64data);