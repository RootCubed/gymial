# Lists in the KZO TAM-Intranet

## Publicly available for students

| ID | Description |
|---|---|
| 20 | class teacher |
| 30 | own account |
| 39 | KZO teachers |
| 45 | own class |
| 46 | own courses |
| 112 | absences |

## Need /list/getlist for these

12: get class list (id: class id)

40: Course participants (id: course id)

## Empty data
34

## Error reading data
17, 32, 36, 37

## Lists referenced in the changelog of the staging environment
- 1500-1503
- 1301, 1302
- 702
- 115 (only BZU possibly)
- 102 (only DHZ possibly)
- 100
- 117 (only KHO and KKN possibly)
- 8
- 13
- 1205, 1206

SysList: Added SysList 105 (non-approved lessons of all courses of one class of a class teacher)

046(Parents), 049(CustCoach), 052(Period), 055(ClassMembers), 058(Person), 061(Absence)

Person-Group List 27: Send group mails also to personal and not just to teachers

SysList: CSV exports are by default disallowed to students

SysList: Data exports (CSV, Excel) evoked by students do not contain Person IDs anymore

## List fields

### How this data was gathered

When accessing the endpoint `https://intranet.tam.ch/kzo/list/get-person-detail-list/list/<list id>/id/xxxxxx/noListData/1/selector/config-list-edit` from a non-authorized list, it doesn't return any data. However, it returns a JSON object with header information about the list, like field names and SQL queries.

### 1
```
{
    "CourseID":{
        "field":"Course.CourseID",
        "visible":0,
        "width":30
    },
    "Kurs":{
        "field":"Course.Course",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/840/id/",
            "description":"Kurs",
            "param":"CourseID"
        },
        "width":230
    },
    "Anzahl":{
        "field":"Anzahl",
        "sql":"COUNT(pc2.PersonID)",
        "visible":1,
        "width":100
    },
    "SchülerIn":{
        "field":"SchÃÂ¼lerIn",
        "sql":"CASE WHEN Course.SubjectID IN (21,500) THEN CONCAT(p2.Lastname,' ',p2.GivenName) ELSE '' END",
        "visible":0,
        "width":150
    },
    "Fachtyp":{
        "field":"SubjectType.SubjectTypeShort",
        "visible":1,
        "width":100
    },
    "Pflichtlektionen":{
        "field":"PersonCoursePayroll.BasisLesson",
        "visible":1,
        "width":150
    },
    "Lekt_lt_Lehrplan":{
        "field":"PersonCoursePayroll.LessonsStandardPaid",
        "visible":1,
        "width":150
    },
    "Gewicht":{
        "field":"PersonCoursePayroll.weight",
        "visible":1,
        "width":100
    },
    "Lektionen_effektiv":{
        "field":"PersonCoursePayroll.PaidLesson",
        "visible":1,
        "width":100
    },
    "Anz_Wochen":{
        "field":"PersonCoursePayroll.Weeks",
        "visible":1,
        "width":100
    },
    "Anteil_Zeitperiode":{
        "field":"PersonCoursePayroll.PaidPercentage",
        "visible":1,
        "width":100
    },
    "Bemerkung":{
        "field":"PersonCoursePayroll.Remark",
        "visible":1
    },
    "StartDate":{
        "field":"Course.StartDate",
        "visible":0
    },
    "EndDate":{
        "field":"Course.EndDate",
        "visible":0
    }
}
```

### 2
```
{
    "CourseID":{
        "field":"Course.CourseID",
        "visible":0
    },
    "PersonID":{
        "field":"PersonAddress.PersonID",
        "visible":1
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1,
        "link":{
            "url":"PersonID",
            "description":"Nachname",
            "param":"PersonID"
        }
    },
    "street":{
        "field":"Person.Lastname",
        "visible":1,
        "link":{
            "url":"PersonID",
            "description":"Nachname",
            "param":"PersonID"
        }
    }
}
```

### 3
```
{
    "CourseID":{
        "field":"Course.CourseID",
        "visible":1,
        "width":70
    },
    "Kursname":{
        "field":"Course.Course",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/840/id/",
            "description":"Kursname",
            "param":"CourseID"
        },
        "width":300
    },
    "Anzahl":{
        "field":"Anzahl",
        "sql":"COUNT(DISTINCT pc2.PersonID)",
        "visible":1,
        "width":120
    },
    "StartDate":{
        "field":"Course.StartDate",
        "visible":0
    },
    "EndDate":{
        "field":"Course.EndDate",
        "visible":0
    },
    "Lehrperson":{
        "field":"Lehrperson",
        "visible":1,
        "funct":"GROUP_CONCAT(DISTINCT Person.Lastname, ' ',Person.GivenName)"
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1
    },
    "Mail":{
        "field":"Mail",
        "visible":1,
        "funct":"CONCAT(Person.Username,'@kzo.ch')"
    },
    "CourseCommonName":{
        "field":"Course.CourseCommonName",
        "visible":1
    }
}
```

### 4
```
{
    "CourseID":{
        "field":"Course.CourseID",
        "visible":0
    },
    "Kursname":{
        "field":"Course.Course",
        "visible":1,
        "link":{
            "url":"/list/getlist/list/2/period/102/id/",
            "description":"Kursname",
            "param":"CourseID"
        }
    },
    "Klassenstufe":{
        "field":"Course.CourseLevel",
        "visible":1
    }
}
```

### 6
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":1
    },
    "GivenName":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    }
}
```

### 7
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0,
        "width":1
    },
    "Name2":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "width":200
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "width":120
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1,
        "width":100
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')",
        "width":60
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":1,
        "width":80
    },
    "LP":{
        "sql":"if(Person.Gender='m','seine LP','ihre LP')",
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "visible":1,
        "link":{
            "url":"/list/getlist/list/702/id/",
            "description":"LP",
            "param":"PersonID"
        },
        "width":70
    },
    "Adresse":{
        "field":"Adresse",
        "visible":1,
        "funct":"Address.Street1",
        "width":150
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1,
        "width":60
    },
    "Ort":{
        "field":"Address.City",
        "visible":1,
        "width":130
    },
    "PLZ_Ort":{
        "field":"PLZ_Ort",
        "visible":0,
        "funct":"concat_ws(' ',Address.Zip, Address.City)"
    },
    "Mail":{
        "field":"Mail",
        "visible":1,
        "width":200,
        "funct":"concat(Person.Username,'@studmail.kzo.ch')"
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1,
        "width":100
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "type":"date",
        "visible":1
    }
}
```

### 8
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0,
        "width":40
    },
    "Name2":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "width":220,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1,
        "width":120,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1,
        "width":80
    },
    "Anrede":{
        "field":"Anrede",
        "visible":1,
        "funct":"IF(Person.Gender='m', 'Herr', 'Frau')",
        "width":80
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1,
        "width":50
    },
    "Adresse":{
        "field":"Address.Street1",
        "width":160,
        "visible":1
    },
    "PLZ":{
        "field":"Address.zip",
        "visible":1,
        "width":60
    },
    "Ort":{
        "field":"Address.city",
        "visible":1,
        "width":150
    },
    "Mail":{
        "field":"PersonCoordinateValues.Email",
        "visible":1,
        "width":200
    },
    "Telefon":{
        "field":"PersonCoordinateValues.Telefon",
        "visible":1,
        "width":150
    },
    "Handy":{
        "field":"PersonCoordinateValues.Mobile",
        "visible":1,
        "width":150
    },
    "Fächer":{
        "field":"PersonAttribute.AttributeValue",
        "visible":1
    }
}
```

### 9
```
{
    "ClassID":{
        "field":"Class.ClassID",
        "visible":0,
        "width":50
    },
    "PeriodID":{
        "field":"Class.PeriodID",
        "visible":0,
        "width":50
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/12/period/#= PeriodID #/id/",
            "description":"Klasse",
            "param":"ClassID"
        },
        "width":20
    },
    "Profil":{
        "field":"Profile.Profile",
        "visible":1,
        "width":20
    },
    "KL":{
        "field":"Klassenlehrer",
        "visible":1,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "width":50
    },
    "Mail":{
        "field":"Mail",
        "visible":1,
        "funct":"concat(Person.Username,'@kzo.ch')",
        "width":30
    },
    "Anzahl":{
        "field":"Anzahl",
        "visible":1,
        "funct":"count(pc2.PersonID)",
        "width":20
    }
}
```

### 11
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Name":{
        "field":"Person.Lastname",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#,12",
            "description":"Nachname"
        },
        "visible":1
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')"
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1
    },
    "Fach":{
        "field":"Subject.Subject",
        "visible":1
    },
    "Kurs":{
        "field":"Course.Course",
        "visible":1
    },
    "KursTyp":{
        "field":"Course.SubjectTypeID",
        "visible":1
    },
    "Mail":{
        "field":"Mail",
        "funct":"concat(Person.Username,'@kzo.ch')",
        "visible":1
    }
}
```

### 12
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#,12",
            "description":"Nachname"
        }
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender = 'm','Herr', 'Frau')",
        "width":50
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":0,
        "width":40
    },
    "BGMU":{
        "field":"s2.SubjectShort",
        "visible":1,
        "width":50
    },
    "Profil":{
        "field":"Subject.SubjectShort",
        "visible":1,
        "width":50
    },
    "Mail":{
        "field":"`PersonCoordinateValues`.Email",
        "visible":1
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":1,
        "funct":"DATE_FORMAT(Person.Birthday, '%d.%m.%Y')"
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1,
        "width":50
    },
    "Ort":{
        "field":"Address.City",
        "visible":1
    },
    "Telefon":{
        "field":"`PersonCoordinateValues`.Telefon",
        "visible":1
    },
    "Mobile":{
        "field":"`PersonCoordinateValues`.Mobile",
        "visible":0
    }
}
```

### 13
```
{
    "ClassID":{
        "field":"Class.ClassID",
        "visible":0,
        "width":60
    },
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/12/id/",
            "description":"Klasse",
            "param":"ClassID"
        },
        "width":100
    },
    "KL":{
        "field":"Klassenlehrer",
        "visible":1,
        "funct":"GROUP_CONCAT(DISTINCT CONCAT(Person.Lastname,' ', Person.GivenName) SEPARATOR ', ')",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#, 13",
            "description":"KL"
        },
        "width":200
    },
    "Profil":{
        "field":"Profile.Profile",
        "visible":1,
        "width":100
    },
    "Anzahl":{
        "field":"Anzahl",
        "sql":"COUNT(DISTINCT pc2.PersonID)",
        "visible":1,
        "width":100
    },
    "PeriodID":{
        "field":"Class.PeriodID",
        "visible":0
    },
    "zust_SL":{
        "field":"zust_SL",
        "visible":1,
        "funct":"concat_ws(' ', concat_ws(', ',p3.Lastname, p3.GivenName), '(', p3.Acronym, ')')"
    }
}
```

### 15
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Anrede":{
        "field":"Anrede",
        "func":"IF(Person.Gender = 'm', 'Herr', 'Frau')",
        "visible":1
    },
    "GivenName":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "link":{
            "url":"/list/index/period/102/id/",
            "description":"Nachname",
            "param":"PersonID"
        },
        "visible":1
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":1
    },
    "Stadt":{
        "field":"Address.City",
        "visible":1
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1
    },
    "Email":{
        "field":"Address.Email",
        "visible":1
    },
    "AddressID":{
        "field":"Address.AddressID",
        "visible":1
    }
}
```

### 17
```
{
    "ClassID":{
        "field":"Class.ClassID",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "GivenName":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Birthday":{
        "field":"Person.Birthday",
        "visible":1
    },
    "KlassenName":{
        "field":"Class.Class",
        "visible":1
    },
    "StartDate":{
        "field":"Class.StartDate",
        "visible":1
    }
}
```

### 18
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')"
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Profil":{
        "field":"Profile.Profile",
        "visible":0
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1
    },
    "Ort":{
        "field":"Address.City",
        "visible":1
    },
    "EMail":{
        "field":"PersonCoordinateValues.Email",
        "visible":1
    },
    "Telefon":{
        "field":"PersonCoordinateValues.Telefon",
        "visible":1
    },
    "Eintritt":{
        "field":"PersonDepartment.EnterDate",
        "visible":0,
        "funct":"DATE_FORMAT(PersonDepartment.EnterDate, '%d.%m.%Y')"
    }
}
```

### 19
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "GivenName":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "Ort":{
        "field":"Address.Zip",
        "visible":1
    },
    "Telefon":{
        "field":"PersonCoordinate.CoordinateValue",
        "visible":1
    }
}
```

### 20
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "GivenName":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "Ort":{
        "field":"Address.Zip",
        "visible":1
    },
    "EMail":{
        "field":"PersonCoordinateValues.Email",
        "visible":1
    },
    "Telefon":{
        "field":"PersonCoordinateValues.Telefon",
        "visible":1
    },
    "Mobile":{
        "field":"PersonCoordinateValues.Mobile",
        "visible":1
    }
}
```

### 23
```
{
    "id":{
        "field":"Person.PersonID",
        "visible":1
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')"
    },
    "Titel":{
        "field":"Person.Title",
        "visible":1
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":1
    },
    "Zivilstand":{
        "field":"Person.CivilStatus",
        "visible":1
    },
    "Staatsangehoerigkeit":{
        "field":"Person.Citizenship",
        "visible":1
    },
    "AHV":{
        "field":"Person.SocialSecurityNumber",
        "visible":1
    },
    "Eintrittsdatum":{
        "field":"Person.VirtualEnterDate",
        "visible":1
    }
}
```

### 25
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "Ort":{
        "field":"Address.Zip",
        "visible":1
    },
    "Telefon":{
        "field":"p1.Telefon",
        "visible":1
    },
    "Mobile":{
        "field":"p3.Mobile",
        "visible":1
    },
    "Email":{
        "field":"p2.Email",
        "visible":1
    }
}
```

### 26
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Name2":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "width":220
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')"
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1
    },
    "Mail":{
        "field":"Mail",
        "visible":1,
        "funct":"if(Person.Username='','',concat(Person.Username,'@kzo.ch'))"
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":0
    }
}
```

### 27
```
{
    "AssociationID":{
        "field":"Association.AssociationID",
        "visible":0
    },
    "Fachschaft":{
        "field":"Association.Association",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/28/id/",
            "description":"Fachschaft",
            "param":"AssociationID"
        }
    }
}
```

### 28
```
{
    "PersonID":{
        "field":"p.PersonID",
        "visible":0
    },
    "Name":{
        "field":"p.Lastname",
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":1
    },
    "Mail":{
        "field":"Mail",
        "visible":1,
        "funct":"concat(p.Username,'@kzo.ch')"
    }
}
```

### 29
```
{
    "PersonID":{
        "field":"employeenumber",
        "title":"PersonID",
        "width":90
    },
    "Vorname":{
        "field":"givenName",
        "title":"Vorname",
        "width":90
    },
    "Nachname":{
        "field":"sn",
        "title":"Nachname",
        "width":90
    },
    "Username":{
        "field":"uid",
        "title":"Username",
        "width":90
    },
    "Klasse":{
        "field":"tamclassname",
        "title":"Klasse",
        "width":60
    },
    "Mail":{
        "field":"mail",
        "title":"E-Mail",
        "width":90,
        "template":"emailTemplate"
    },
    "Department_Role":{
        "field":"tamprimaryrole",
        "title":"Department_Role",
        "width":90
    }
}
```

### 30
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":1,
        "funct":"DATE_FORMAT(Person.Birthday, '%d.%m.%Y')"
    },
    "Profil":{
        "field":"Profile.Profile",
        "visible":0
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "Ort":{
        "field":"Address.City",
        "visible":1
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1
    },
    "EMail":{
        "field":"PersonCoordinateValues.Email",
        "visible":1
    },
    "Telefon":{
        "field":"PersonCoordinateValues.Telefon",
        "visible":1
    },
    "Eintritt":{
        "field":"PersonDepartment.EnterDate",
        "visible":1,
        "funct":"DATE_FORMAT(PersonDepartment.EnterDate, '%d.%m.%Y')"
    }
}
```

### 33
```
{
    "PersonID":{
        "field":"employeenumber",
        "title":"PersonID",
        "width":90
    },
    "Vorname":{
        "field":"givenName",
        "title":"Vorname",
        "width":90
    },
    "Nachname":{
        "field":"sn",
        "title":"Nachname",
        "width":90
    },
    "Username":{
        "field":"uid",
        "title":"Username",
        "template":"templateVar",
        "width":90
    },
    "Klasse":{
        "field":"tamclassname",
        "title":"Klasse",
        "width":90
    },
    "Mail":{
        "field":"mail",
        "title":"E-Mail",
        "width":90,
        "template":"emailTemplate"
    },
    "Department_Role":{
        "field":"tamprimaryrole",
        "title":"Department_Role",
        "width":90
    }
}
```

### 34
```
{
    "TeamID":{
        "field":"Team.TeamID",
        "visible":1
    },
    "Label":{
        "field":"Team.Label",
        "visible":1
    },
    "IndividuelleGruppen":{
        "field":"Team.Label",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/35/id/",
            "description":"IndividuelleGruppen",
            "param":"TeamID"
        }
    }
}
```

### 35
```
{
    "PersonID":{
        "field":"p.PersonID",
        "visible":1
    },
    "Name":{
        "field":"Name",
        "visible":1,
        "funct":"concat_ws(', ',p.Lastname, p.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":1
    },
    "Geburtstag":{
        "field":"p.Birthday",
        "visible":0
    }
}
```

### 36
```
{
    "FeedbackID":{
        "field":"Feedback.FeedbackID",
        "visible":0,
        "width":60
    },
    "Fach":{
        "field":"SubjectType.SubjectType",
        "visible":1,
        "function":"feedback.feedbackEditWindow",
        "link":{
            "url":"/feedback/edit/id/",
            "description":"Fach",
            "param":"FeedbackID"
        },
        "width":220
    },
    "Fachtyp":{
        "field":"Subject.SubjectShort",
        "visible":1,
        "width":100
    },
    "KlassePersonKollege":{
        "field":"FeedbackForm.Label",
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "visible":1,
        "width":230
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":1,
        "width":120
    },
    "Status":{
        "field":"Feedback.Status",
        "visible":1,
        "width":100
    },
    "Termin":{
        "field":"Feedback.YearWeek",
        "visible":1,
        "width":100
    },
    "Form":{
        "field":"FeedbackForm.Label",
        "visible":1,
        "width":300
    },
    "FormType":{
        "field":"Feedback.FeedbackType",
        "visible":1,
        "width":100
    },
    "Bemerkung":{
        "field":"Feedback.Comment",
        "visible":1
    }
}
```

### 37
```
{
    "CourseID":{
        "field":"Course.CourseID",
        "visible":0
    },
    "Kurs":{
        "field":"Course.Course",
        "visible":1
    },
    "FeedbackForm":{
        "field":"FeedbackType.FeedbackTypeName",
        "visible":1
    },
    "Form":{
        "field":"FeedbackForm.Label",
        "visible":1
    },
    "Fach":{
        "field":"Subject.Subject",
        "visible":1
    },
    "Fachtyp":{
        "field":"SubjectType.SubjectType",
        "visible":1
    }
}
```

### 38
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Nachname":{
        "field":"Person.Lastname",
        "visible":0
    },
    "Gender":{
        "field":"Person.Gender",
        "visible":0
    },
    "Name":{
        "field":"Name",
        "visible":1,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":0
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":1
    },
    "Mail":{
        "field":"concat_ws('@kzo.ch',Person.Username,'')",
        "visible":1
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":0
    }
}
```

### 39
```
{
    "Nachname":{
        "field":"Person.Lastname",
        "visible":1
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"if(Person.Gender='m','Herr','Frau')"
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1
    },
    "Name":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "width":250
    },
    "Mail":{
        "field":"Person.Username",
        "visible":1,
        "funct":"concat(Person.Username,'@kzo.ch')"
    }
}
```

### 40
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0,
        "width":1
    },
    "CourseID":{
        "field":"Course.CourseID",
        "visible":0,
        "width":1
    },
    "SchÃÂ¼ler":{
        "field":"`SchÃÂ¼ler`",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "width":150
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1,
        "width":90
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1,
        "width":60
    },
    "EMail":{
        "field":"PersonCoordinateValues.Email",
        "visible":1,
        "width":80
    },
    "Art":{
        "field":"SubjectType.SubjectTypeShort",
        "visible":1,
        "width":50
    },
    "Profil":{
        "field":"Profile.Profile",
        "visible":1,
        "width":50
    },
    "Klasse":{
        "field":"Class.ClassShort",
        "visible":1,
        "width":50
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1,
        "width":130
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1,
        "width":50
    },
    "Ort":{
        "field":"Address.City",
        "visible":1,
        "width":70
    },
    "Telefon":{
        "field":"PersonCoordinateValues.Telefon",
        "visible":1
    }
}
```

### 41
```
{
    "PersonID":{
        "field":"p1.PersonID",
        "visible":0
    },
    "Name2":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',p1.Lastname, p1.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "width":100
    },
    "Name":{
        "field":"p1.Lastname",
        "visible":1,
        "width":100,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"p1.GivenName",
        "visible":1,
        "width":70
    },
    "Anrede":{
        "field":"p1.Gender",
        "visible":1,
        "funct":"IF(p1.Gender='m','Herr','Frau')",
        "width":40
    },
    "Klasse":{
        "field":"cl.Class",
        "visible":1,
        "width":40
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1,
        "width":110
    },
    "LP":{
        "sql":"if(p1.Gender='m','seine LP','ihre LP')",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/702/id/",
            "param":"PersonID",
            "description":"LP"
        },
        "width":70
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1,
        "width":40
    },
    "Ort":{
        "field":"Address.City",
        "visible":1,
        "width":110
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1,
        "width":100
    },
    "Mobile":{
        "field":"pcv.Mobile",
        "visible":1,
        "width":100
    },
    "Mail":{
        "field":"Mail",
        "funct":"concat(p1.Username,'@studmail.kzo.ch')",
        "visible":1,
        "width":200
    },
    "Geburtstag":{
        "field":"p1.Birthday",
        "type":"date",
        "visible":1,
        "width":80
    },
    "Kurs":{
        "field":"c.Course",
        "visible":1,
        "width":150
    },
    "Adresse2":{
        "field":"Adresse",
        "visible":0,
        "funct":"concat_ws(' ',Address.Zip, Address.City)"
    }
}
```

### 42
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Name2":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"Person.GivenName",
        "visible":1
    },
    "Anrede":{
        "field":"Anrede",
        "funct":"IF(Person.Gender='m','Herr','Frau')",
        "visible":1,
        "width":50
    },
    "Kuerzel":{
        "field":"Person.Acronym",
        "visible":1,
        "width":40
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1,
        "width":60
    },
    "Ort":{
        "field":"Address.City",
        "visible":1
    },
    "Telefon_intern":{
        "field":"PersonCoordinateValues.TelefonG",
        "visible":1,
        "width":140
    },
    "Telefon":{
        "field":"PersonCoordinateValues.Telefon",
        "visible":1,
        "width":140
    },
    "Handy":{
        "field":"PersonCoordinateValues.Mobile",
        "visible":1,
        "width":140
    },
    "Mail":{
        "field":"PersonCoordinateValues.Email",
        "visible":1
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":0
    }
}
```

### 43
```
{
    "Semester":{
        "sql":"CONCAT(IF(mod(p.PeriodID,2),'HS','FS'), ' ', floor(1984 + p.PeriodID/2))",
        "visible":1
    },
    "Zeugnis":{
        "field":"rt.ReportTypeShortName",
        "visible":1
    },
    "Komp":{
        "field":"Komp",
        "visible":1,
        "funct":"CASE WHEN pp.ReportTypeID IN (2,4,20) THEN pp.Compensation ELSE '' END",
        "width":30
    },
    "Tiefnoten":{
        "field":"Tiefnoten",
        "visible":1,
        "funct":"CASE WHEN pp.ReportTypeID IN (2,4,20) THEN pp.LowMark ELSE '' END",
        "width":30
    },
    "AVG":{
        "field":"AVG",
        "visible":1,
        "funct":"CASE WHEN pp.ReportTypeID IN (13,14,17,18,601) THEN pp.Average ELSE '' END",
        "width":30
    },
    "Promostand":{
        "field":"mlpr.PromotionRankShort",
        "visible":1
    },
    "Entscheid":{
        "field":"mlpd.PromotionDecisionShort",
        "visible":1,
        "width":30
    }
}
```

### 44
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Memo":{
        "field":"Memo",
        "sql":"REPLACE(Person.Remark,char(10),'<br />')",
        "visible":1
    }
}
```

### 45
```
{
    "PersonID":{
        "field":"p2.PersonID",
        "visible":0,
        "width":5
    },
    "Klasse":{
        "field":"Class.Class",
        "visible":0,
        "width":60
    },
    "Name":{
        "field":"p2.Lastname",
        "visible":1,
        "width":120
    },
    "Vorname":{
        "field":"p2.GivenName",
        "visible":1,
        "width":120
    },
    "Strasse":{
        "field":"a.Street1",
        "visible":1,
        "width":140
    },
    "PLZ":{
        "field":"a.zip",
        "visible":1,
        "width":60
    },
    "Ort":{
        "field":"a.city",
        "visible":1,
        "width":120
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1,
        "width":120
    },
    "EMail":{
        "field":"pcv.Email",
        "visible":1
    }
}
```

### 46
```
{
    "CourseID":{
        "field":"Course.CourseID",
        "visible":0,
        "width":30
    },
    "Kurs":{
        "field":"Course.Course",
        "visible":1,
        "function":"intranet.list.rightGrid.showRightSlideIn",
        "link":{
            "url":"/list/getlist/list/40/id/",
            "description":"Kurs",
            "param":"CourseID"
        },
        "width":80
    },
    "Name":{
        "field":"pL.Lastname",
        "visible":1,
        "width":30
    },
    "Vorname":{
        "field":"pL.GivenName",
        "visible":1,
        "width":30
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1,
        "width":30
    },
    "Email":{
        "field":"pcv.Email",
        "visible":1,
        "width":30
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1,
        "width":30
    },
    "PLZOrt":{
        "field":"PLZOrt",
        "sql":"CONCAT(Address.Zip,' ',Address.City)",
        "visible":1,
        "width":30
    },
    "StartDate":{
        "field":"Course.StartDate",
        "visible":0
    },
    "EndDate":{
        "field":"Course.EndDate",
        "visible":0
    }
}
```

### 47
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Name":{
        "field":"Person.Lastname",
        "width":80,
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"Person.GivenName",
        "width":60,
        "visible":1
    },
    "Gender":{
        "field":"Person.Gender",
        "visible":0
    },
    "Nachname":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "width":60
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')",
        "width":40
    },
    "Geburtstag":{
        "field":"Person.Birthday",
        "visible":0,
        "width":50
    },
    "Email":{
        "field":"pvc.Email",
        "visible":1,
        "width":50
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":0,
        "width":50
    },
    "Telefon_intern":{
        "field":"pvc.TelefonG",
        "visible":1,
        "width":50
    }
}
```

### 48
```
{
    "PersonID":{
        "field":"Person.PersonID",
        "visible":0
    },
    "Gender":{
        "field":"Person.Gender",
        "visible":0
    },
    "Name2":{
        "field":"Name",
        "visible":0,
        "funct":"concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        },
        "width":250
    },
    "Name":{
        "field":"Person.Lastname",
        "visible":1,
        "function":"intranet.ui.profile.getAllPersonalInfos",
        "param":{
            "value":"#=PersonID#",
            "description":"Name"
        }
    },
    "Vorname":{
        "field":"Person.Givenname",
        "visible":1
    },
    "Anrede":{
        "field":"Person.Gender",
        "visible":1,
        "funct":"IF(Person.Gender='m','Herr','Frau')"
    },
    "Adresse":{
        "field":"Address.Street1",
        "visible":1
    },
    "PLZ":{
        "field":"Address.Zip",
        "visible":1
    },
    "Ort":{
        "field":"Address.City",
        "visible":1
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1
    },
    "Mail":{
        "field":"pcv.Email",
        "visible":1
    }
}
```

### 49
```
{
    "PersonID":{
        "field":"PersonPayroll.PersonID",
        "visible":0
    },
    "Semester":{
        "field":"Period.Period",
        "visible":1,
        "width":150
    },
    "Altersbed_Pensenreduktion":{
        "field":"PersonPayroll.ReducedPensum",
        "visible":1,
        "width":150
    },
    "Basisstundenzahl":{
        "field":"PersonPayroll.LessonsBase",
        "visible":1,
        "width":150
    },
    "Zuges_Pensum":{
        "field":"PersonPayroll.LessonsWarranted",
        "visible":1,
        "width":150
    },
    "Stand_Anf_Sem":{
        "field":"PersonPayroll.LessonBalanceLastSemester",
        "visible":1,
        "width":150
    },
    "Prozent":{
        "field":"PersonPayroll.PercentageBalanceEndSemester",
        "visible":1,
        "width":80
    },
    "Ausbez_Lektionen":{
        "field":"PersonPayroll.LessonsPaid",
        "visible":1,
        "width":150
    },
    "Stand_Ende_Sem":{
        "field":"PersonPayroll.LessonBalanceEndSemester",
        "visible":1,
        "width":200
    },
    "Lohnklasse":{
        "field":"PersonPayroll.SalaryCategory",
        "visible":1,
        "width":100
    },
    "Lohnstufe":{
        "field":"PersonPayroll.SalaryLevel",
        "visible":1,
        "width":100
    },
    "Memo":{
        "field":"Memo",
        "sql":"REPLACE(PersonPayroll.Remark,char(10),'<br />')",
        "visible":1
    }
}
```

### 50
```
{
    "PersonID":{
        "field":"p.PersonID",
        "visible":0
    },
    "Name":{
        "field":"p.Lastname",
        "visible":0,
        "width":150
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":0,
        "width":150
    },
    "Klasse":{
        "field":"c.Class",
        "visible":0,
        "width":150
    },
    "Kurs":{
        "field":"ec.Label",
        "visible":1,
        "width":350
    },
    "Buchungen":{
        "field":"COUNT(p.PersonID)",
        "visible":1
    }
}
```

### 55
```
{
    "Kurs":{
        "field":"ec.Label",
        "visible":1,
        "width":350
    },
    "PersonID":{
        "field":"p.PersonID",
        "visible":0
    },
    "Name":{
        "field":"p.Lastname",
        "visible":1,
        "width":150
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":1,
        "width":150
    },
    "Klasse":{
        "field":"c.Class",
        "visible":1,
        "width":150
    },
    "Prio":{
        "field":"ecp.Priority",
        "visible":1,
        "width":50
    }
}
```

### 56
```
{
    "Kurs":{
        "field":"ec.Label",
        "visible":1,
        "width":350
    },
    "PersonID":{
        "field":"p.PersonID",
        "visible":0
    },
    "Name":{
        "field":"p.Lastname",
        "visible":1,
        "width":150
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":1,
        "width":150
    },
    "Klasse":{
        "field":"c.Class",
        "visible":1,
        "width":150
    }
}
```

### 60
```
{
    "PersonID":{
        "field":"p.PersonID",
        "visible":0
    },
    "Schüler":{
        "field":"Schüler",
        "sql":"CONCAT(s.Lastname,' ',s.GivenName)",
        "visible":1
    },
    "Nachname":{
        "field":"p.Lastname",
        "visible":1
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":1,
        "width":80
    },
    "Anrede":{
        "field":"CASE p.Gender WHEN 'm' THEN 'Herr' WHEN 'f' THEN 'Frau' WHEN 'm/f' THEN 'Familie' END",
        "visible":1,
        "width":70
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1,
        "width":120
    },
    "Mobile":{
        "field":"pcv.Mobile",
        "visible":1,
        "width":120
    },
    "EMail":{
        "field":"pcv.Email",
        "visible":1,
        "width":150
    },
    "Adresse":{
        "field":"a.Street1",
        "visible":1,
        "width":50
    },
    "PLZ":{
        "field":"a.Zip",
        "visible":1,
        "width":50
    },
    "Ort":{
        "field":"a.City",
        "visible":1,
        "width":50
    }
}
```

### 61
```
{
    "PersonID":{
        "field":"p.PersonID",
        "visible":0
    },
    "Schüler":{
        "field":"Schüler",
        "sql":"CONCAT(s.Lastname,' ',s.GivenName)",
        "visible":1
    },
    "Nachname":{
        "field":"p.Lastname",
        "visible":1
    },
    "Vorname":{
        "field":"p.GivenName",
        "visible":1,
        "width":80
    },
    "Anrede":{
        "field":"CASE p.Gender WHEN 'm' THEN 'Herr' WHEN 'f' THEN 'Frau' WHEN 'm/f' THEN 'Familie' END",
        "visible":1,
        "width":70
    },
    "Telefon":{
        "field":"pcv.Telefon",
        "visible":1,
        "width":120
    },
    "Mobile":{
        "field":"pcv.Mobile",
        "visible":1,
        "width":120
    },
    "EMail":{
        "field":"pcv.Email",
        "visible":1,
        "width":150
    },
    "Adresse":{
        "field":"a.Street1",
        "visible":1,
        "width":50
    },
    "PLZ":{
        "field":"a.Zip",
        "visible":1,
        "width":50
    },
    "Ort":{
        "field":"a.City",
        "visible":1,
        "width":50
    }
}
```

### 100
```
{
    "Name":{
        "field":"tt.Lastname",
        "visible":1,
        "width":140
    },
    "Vorname":{
        "field":"tt.GivenName",
        "visible":1,
        "width":140
    },
    "Kurs":{
        "field":"tt.CourseShort",
        "visible":1,
        "width":100
    },
    "Klasse":{
        "field":"tt.ClassShort",
        "visible":1,
        "width":300
    },
    "Datum":{
        "field":"tt.Date",
        "visible":1,
        "width":100
    },
    "Lektion":{
        "field":"tt.Start",
        "visible":1
    },
    "PersonID":{
        "field":"tt.PersonID",
        "visible":0
    },
    "CourseID":{
        "field":"tt.CourseID",
        "visible":0
    },
    "StartTime":{
        "field":"tt.StartTime",
        "visible":0
    },
    "EndTime":{
        "field":"tt.EndTime",
        "visible":0
    },
    "LessonD":{
        "field":"tt.Date",
        "visible":0
    },
    "Bestätigung":{
        "field":"Link",
        "visible":0,
        "function":"intranet.list.confirmSingleLesson",
        "param":{
            "description":"'Lektion bestätigen'",
            "value":"this"
        },
        "width":300
    }
}
```

### 101
```
{
    "PersonID":{
        "field":"tt.PersonID",
        "visible":0
    },
    "Name":{
        "field":"tt.Lastname",
        "visible":1,
        "width":140
    },
    "Vorname":{
        "field":"tt.GivenName",
        "visible":1,
        "width":140
    },
    "Fach":{
        "field":"tt.CourseShort",
        "visible":1,
        "width":100
    },
    "Klasse":{
        "field":"tt.ClassShort",
        "visible":1,
        "width":100
    },
    "Datum":{
        "field":"tt.Date",
        "visible":1,
        "width":100
    },
    "Lektion":{
        "field":"tt.Start",
        "visible":1
    },
    "Link":{
        "field":"tt.Link",
        "template":"<a href= '#: Link #' >Link zur Lektion</a>",
        "visible":1
    },
    "CourseID":{
        "field":"tt.CourseID",
        "visible":0
    },
    "StartTime":{
        "field":"tt.StartTime",
        "visible":0
    },
    "EndTime":{
        "field":"tt.EndTime",
        "visible":0
    },
    "LessonD":{
        "field":"tt.Date",
        "visible":0
    },
    "Gemeldet":{
        "field":"Gemeldet",
        "visible":1,
        "sql":"(SELECT CONCAT(IF(count(agr2.AbsenceGroupID) = 0, 'alle ', CONCAT(count(*) - count(agr2.AbsenceGroupID), ' von ')), count(*), ' anwesend') FROM PersonCourse WHERE PersonCourseRoleId = 1 AND tt.Date BETWEEN StartDate AND EndDate AND courseid = tt.CourseID)",
        "width":200
    },
    "Bestätigung":{
        "field":"Link",
        "visible":1,
        "function":"intranet.list.confirmSingleLesson",
        "param":{
            "description":"'Lektion bestätigen'",
            "value":"this"
        },
        "width":300
    }
}
```

### 102
```
{
    "Kurs":{
        "field":"co.CourseShort",
        "visible":1,
        "width":100
    },
    "Datum":{
        "field":"tte.Date",
        "visible":1,
        "width":120
    },
    "Zeit":{
        "field":"LEFT(tte.StartTime,5)",
        "visible":1,
        "width":120
    },
    "Lehrperson":{
        "sql":"CONCAT(p2.Lastname,', ',p2.GivenName)",
        "visible":1,
        "width":160
    },
    "AbsenzGruppe":{
        "field":"ag.Name",
        "visible":1,
        "width":140
    },
    "AbsenzType":{
        "field":"aty.Name",
        "visible":1,
        "width":140
    },
    "Status":{
        "field":"ast.Name",
        "visible":1
    }
}
```

### 105
```
{
    "Name":{
        "field":"le.Lastname",
        "visible":1,
        "width":140
    },
    "Vorname":{
        "field":"le.GivenName",
        "visible":1,
        "width":140
    },
    "Kurs":{
        "field":"le.CourseShort",
        "visible":1,
        "width":100
    },
    "Klasse":{
        "sql":"le.ClassShort",
        "visible":1,
        "width":300
    },
    "Datum":{
        "field":"le.Date",
        "visible":1,
        "width":100
    },
    "Lektion":{
        "sql":"le.Start",
        "visible":1
    },
    "PersonID":{
        "field":"le.PersonID",
        "visible":0
    }
}
```

### 110
```
{
    "PersonID": {
        "field": "Person.PersonID",
        "visible": 0
    },
    "Nachname": {
        "field": "Person.Lastname",
        "visible": 0
    },
    "Gender": {
        "field": "Person.Gender",
        "visible": 0
    },
    "Name": {
        "field": "Name",
        "visible": 1,
        "funct": "concat_ws(', ',Person.Lastname, Person.GivenName)",
        "function": "intranet.ui.profile.getAllPersonalInfos",
        "param": {
            "value": "#=PersonID#",
            "description": "Name"
        },
        "width": 250
    },
    "Geburtstag": {
        "field": "Person.Birthday",
        "visible": 0,
        "width": 50
    },
    "Email": {
        "field": "pvc.Email",
        "visible": 1,
        "width": 250
    },
    "Adresse": {
        "field": "Address.Street1",
        "visible": 0,
        "width": 50
    },
    "Telefon": {
        "field": "pvc.TelefonG",
        "visible": 1
    }
}
```

### 112
```
{
    "Kurs_Anlass": {
        "field": "IF(co.CourseID IS NULL, aev.TimetableEventName, co.Course)",
        "visible": 1,
        "width": 250
    },
    "Datum": {
        "sql": "DATE_FORMAT(aev.StartTime,'%d.%m.%Y')",
        "visible": 1,
        "width": 120
    },
    "Zeit_Anzahl_Lekt": {
        "sql": "IF(co.CourseID IS NULL, concat(count(distinct aen.AbsenceEntryID), ' Lektionen'), LEFT(TIME(aev.StartTime), 5))",
        "visible": 1,
        "width": 120
    },
    "Lehrperson": {
        "sql": "CONCAT(teach.Lastname, ', ', teach.GivenName)",
        "visible": 1,
        "width": 160
    },
    "Ersteller": {
        "sql": "CONCAT(pers.Lastname, ', ', pers.GivenName)",
        "visible": 1,
        "width": 160
    },
    "Absenzgruppe": {
        "field": "agr.Name",
        "visible": 0,
        "width": 140
    },
    "Absenztype": {
        "field": "aty.Name",
        "visible": 0,
        "width": 140
    },
    "Status": {
        "field": "ast.Name",
        "visible": 1
    },
    "PersonID": {
        "field": "teach.PersonID",
        "visible": 0
    },
    "AbsenceEventID": {
        "field": "aev.AbsenceEventID",
        "visible": 0
    }
}
```

### 115
```
{
    "Name": {
        "sql": "CONCAT(stud.Lastname,', ',stud.GivenName)",
        "field": "Name",
        "width": 250,
        "visible": 1,
        "function": "intranet.list.rightGrid.showRightSlideIn",
        "link": {
            "url": "/list/getlist/list/112/id/",
            "description": "Name",
            "param": "PersonID"
        }
    },
    "Klasse": {
        "field": "cl.Class",
        "width": 150,
        "visible": 1
    },
    "Anzahl": {
        "sql": "LPAD(COUNT(*),3,' ')",
        "field": "Anzahl",
        "visible": 1,
        "width": 100
    },
    "O": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=1,1,0)),3,' ')",
        "field": "S",
        "visible": 1,
        "width": 100
    },
    "E": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=2,1,0)),3,' ')",
        "field": "E",
        "visible": 1,
        "width": 100
    },
    "U": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=3,1,0)),3,' ')",
        "field": "S",
        "visible": 1,
        "width": 100
    },
    "V": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=4,1,0)),3,' ')",
        "field": "O",
        "visible": 1
    },
    "J": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=5,1,0)),3,' ')",
        "field": "J",
        "visible": 1
    },
    "PersonID": {
        "field": "stud.PersonID",
        "visible": 0
    }
}
```

### 116
```
{
    "Name": {
        "sql": "CONCAT(stud.Lastname,', ',stud.GivenName)",
        "field": "Name",
        "width": 250,
        "visible": 1,
        "function": "intranet.list.rightGrid.showRightSlideIn",
        "link": {
            "url": "/list/getlist/list/112/id/",
            "description": "Name",
            "param": "PersonID"
        }
    },
    "Klasse": {
        "field": "cl.Class",
        "width": 150,
        "visible": 1
    },
    "Anzahl": {
        "sql": "LPAD(COUNT(*),3,' ')",
        "field": "Anzahl",
        "width": 100,
        "visible": 1
    },
    "O": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=1,1,0)),3,' ')",
        "field": "O",
        "visible": 1,
        "width": 100
    },
    "E": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=2,1,0)),3,' ')",
        "field": "E",
        "visible": 1,
        "width": 100
    },
    "U": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=3,1,0)),3,' ')",
        "field": "E",
        "visible": 1,
        "width": 100
    },
    "V": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=4,1,0)),3,' ')",
        "field": "V",
        "visible": 1
    },
    "J": {
        "sql": "LPAD(SUM(IF(aen.AbsenceStatusID=5,1,0)),3,' ')",
        "field": "J",
        "visible": 1
    },
    "PersonID": {
        "field": "stud.PersonID",
        "visible": 0
    }
}
```

### 118
```
{
    "PersonID": {
        "field": "Person.PersonID",
        "visible": 0
    },
    "Vorname": {
        "field": "Person.GivenName",
        "visible": 1
    },
    "Nachname": {
        "field": "Person.Lastname",
        "visible": 1
    },
    "Profil": {
        "field": "Profile.Profile",
        "visible": 0
    },
    "Adresse": {
        "field": "Address.Street1",
        "visible": 1
    },
    "Ort": {
        "field": "Address.City",
        "visible": 1
    },
    "PLZ": {
        "field": "Address.Zip",
        "visible": 1
    },
    "EMail": {
        "field": "PersonCoordinateValues.Email",
        "function": "intranet.ui.profile.mailPopup",
        "param": {
            "value": "#=EMail#",
            "description": "EMail"
        },
        "visible": 1
    },
    "Telefon": {
        "field": "PersonCoordinateValues.Telefon",
        "visible": 1
    },
    "Mobil": {
        "field": "PersonCoordinateValues.Mobile",
        "visible": 1
    },
    "Name_und_Klasse": {
        "field": "Name_Klasse",
        "sql": "CONCAT(Person.GivenName,' ',Person.Lastname,IFNULL(CONCAT(', ',Class.Class),''))",
        "visible": 1
    },
    "Vorname2": {
        "field": "Person.MiddleName",
        "visible": 1
    },
    "Buergerort": {
        "field": "Person.Citizenship",
        "visible": 1
    },
    "Versicherungsnummer": {
        "field": "Person.SocialSecurityNumber",
        "visible": 1
    },
    "Birthday": {
        "field": "Person.Birthday",
        "visible": 1
    }
}
```

### 121
```
{
    "ClassID": {
        "field": "cl.ClassID",
        "visible": 0
    },
    "Klasse": {
        "field": "cl.Class",
        "function": "intranet.list.rightGrid.showRightSlideIn",
        "link": {
            "url": "/list/getlist/list/123/id/",
            "description": "Klasse",
            "param": "ClassID"
        },
        "visible": 1
    }
}
```

### 122
```
{
    "PersonID": {
        "field": "Person.PersonID",
        "visible": 0
    },
    "Nachname": {
        "field": "Person.Lastname",
        "visible": 1,
        "function": "intranet.ui.profile.getAllPersonalInfos",
        "param": {
            "value": "#=PersonID#,12",
            "description": "Nachname"
        }
    },
    "Vorname": {
        "field": "Person.GivenName",
        "visible": 1
    },
    "Anrede": {
        "field": "Person.Gender",
        "visible": 0,
        "funct": "IF(Person.Gender = 'm','Herr', 'Frau')",
        "width": 30
    },
    "Profil": {
        "field": "PersonClass.ClassId",
        "visible": 0,
        "width": 50
    },
    "Promostand": {
        "field": "PersonClass.PersonID",
        "funct": "'to-do'",
        "visible": 0,
        "width": 50
    },
    "Sprachen": {
        "field": "PersonClass.PersonID",
        "funct": "'to-do'",
        "visible": 0,
        "width": 50
    },
    "EF": {
        "field": "PersonClass.PersonID",
        "funct": "'to-do'",
        "visible": 0,
        "width": 50
    },
    "Klasse": {
        "field": "Class.Class",
        "visible": 1,
        "width": 30
    },
    "BGMU": {
        "field": "s2.SubjectShort",
        "visible": 1,
        "width": 10
    },
    "SP": {
        "field": "Subject.SubjectShort",
        "visible": 1,
        "width": 10
    },
    "Geburtstag": {
        "field": "Person.Birthday",
        "visible": 0,
        "width": 100,
        "funct": "DATE_FORMAT(Person.Birthday, '%d.%m.%Y')"
    }
}
```

### 123
```
{
    "Fach": {
        "field": "co.Course",
        "width": 220,
        "visible": 1
    },
    "Lehrperson": {
        "sql": "CONCAT(p.Lastname,' ',p.GivenName)",
        "width": 250,
        "visible": 1
    },
    "Datum": {
        "field": "aev.StartTime",
        "visible": 1,
        "funct": "DATE_FORMAT(aev.StartTime,'%d.%m.%Y')"
    },
    "Zeit": {
        "sql": "CONCAT(Date_FORMAT(aev.StartTime,'%H:%i'),'-',Date_FORMAT(aev.EndTime,'%H:%i'))",
        "visible": 1
    }
}
```

### 126
```
{
    "Name": {
        "sql": "CONCAT(stud.Lastname,', ',stud.GivenName)",
        "field": "Name",
        "width": 250,
        "visible": 1,
        "function": "intranet.list.rightGrid.showRightSlideIn",
        "link": {
            "url": "/list/getlist/list/112/id/",
            "description": "Name",
            "param": "PersonID"
        }
    },
    "Klasse": {
        "field": "cl.Class",
        "width": 150,
        "visible": 1
    },
    "Anzahl": {
        "sql": "LPAD(COUNT(*),3,' ')",
        "field": "Anzahl",
        "visible": 1
    },
    "X": {
        "sql": "SUM(IF(aen.AbsenceStatusID=1,1,0))",
        "field": "X",
        "visible": 0,
        "width": 100
    },
    "E": {
        "sql": "SUM(IF(aen.AbsenceStatusID=2,1,0))",
        "field": "E",
        "visible": 0,
        "width": 100
    },
    "S": {
        "sql": "SUM(IF(aen.AbsenceStatusID=3,1,0))",
        "field": "S",
        "visible": 0,
        "width": 100
    },
    "O": {
        "sql": "SUM(IF(aen.AbsenceStatusID=3,1,0))",
        "field": "O",
        "visible": 0
    },
    "PersonID": {
        "field": "stud.PersonID",
        "visible": 0
    }
}
```

### 132
```
{
    "PersonID": {
        "field": " PersonDossier.PersonID",
        "visible": 0
    },
    "DAG_Datum": {
        "field": "REPLACE(DATE_FORMAT(Dossier.DossierDate,'%d.%m.%Y'),'00.00.0000','')",
        "visible": 1
    },
    "Initialguthaben": {
        "field": "Dossier.Credit",
        "visible": 1
    },
    "Saldo": {
        "field": "Dossier.Balance",
        "visible": 1
    },
    "DAG_Typ": {
        "field": "Dossier.SeniorityBenefitYear",
        "visible": 1
    },
    "Bezugsform": {
        "field": "Dossier.TypeOfPayment",
        "visible": 1
    }
}
```

### 160
```
{
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Nachname": {
        "field": "p.Lastname",
        "width": 100,
        "visible": 1
    },
    "Vorname": {
        "field": "p.GivenName",
        "width": 100,
        "visible": 1
    },
    "Anrede": {
        "field": "CASE p.Gender WHEN 'm' THEN 'Herr' WHEN 'f' THEN 'Frau' WHEN 'm/f' THEN 'Familie' END",
        "visible": 1,
        "width": 60
    },
    "Adresse": {
        "field": "a.Street1",
        "visible": 1,
        "width": 100
    },
    "PLZ": {
        "field": "a.Zip",
        "visible": 1,
        "width": 60
    },
    "Ort": {
        "field": "a.City",
        "visible": 1,
        "width": 120
    },
    "EMail": {
        "field": "pcv.Email",
        "visible": 1,
        "width": 200
    },
    "TelefonP": {
        "field": "pcv.TelefonG",
        "visible": 1,
        "width": 60
    },
    "TelefonG": {
        "field": "pcv.Telefon",
        "visible": 1,
        "width": 60
    },
    "Mobile": {
        "field": "pcv.Mobile",
        "visible": 1,
        "width": 120
    },
    "Kind": {
        "field": "Kind",
        "sql": "GROUP_CONCAT(CONCAT(s.GivenName,' ',s.Lastname,' (',c.Class,')') SEPARATOR ', ')",
        "visible": 1,
        "width": 120
    },
    "Bez": {
        "field": "CASE pp.PersonRelativeTypeID WHEN 4 THEN 'Eltern' WHEN 3 THEN 'Weiterer Kontakt' ELSE pp.PersonRelativeTypeID END",
        "visible": 1,
        "width": 120
    },
    "informiert": {
        "field": "pp.ShouldBeInformed",
        "visible": 1
    }
}
```

### 192
```
{
    "Kurs": {
        "field": "co.Course",
        "visible": 1,
        "width": 250
    },
    "Datum": {
        "sql": "DATE_FORMAT(aev.StartTime,'%d.%m.%Y')",
        "visible": 1,
        "width": 120
    },
    "Zeit": {
        "sql": "LEFT(TIME(aev.StartTime), 5)",
        "visible": 1,
        "width": 120
    },
    "Lehrperson": {
        "sql": "CONCAT(teach.Lastname, ', ', teach.GivenName)",
        "visible": 1,
        "width": 160
    },
    "Absenzgruppe": {
        "field": "agr.Name",
        "visible": 0,
        "width": 140
    },
    "Absenztype": {
        "field": "aty.Name",
        "visible": 0,
        "width": 140
    },
    "Status": {
        "field": "ast.Name",
        "visible": 1
    },
    "PersonID": {
        "field": "teach.PersonID",
        "visible": 0
    }
}
```

### 701
```
{
    "CourseID": {
        "field": "Course.CourseID",
        "visible": 1
    }
}
```

### 702
```
{
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Lehrperson": {
        "field": "Lehrperson",
        "sql": "CONCAT(p.Lastname,', ',p.GivenName)",
        "visible": 1
    },
    "EMail": {
        "field": "pcv.Email",
        "visible": 1
    },
    "Kursname": {
        "field": "c.Course",
        "visible": 1
    }
}
```

### 840
```
{
    "PersonID": {
        "field": "Person.PersonID",
        "visible": 0,
        "width": 1
    },
    "SchÃÂ¼ler": {
        "field": "`SchÃÂÃÂÃÂÃÂ¼ler`",
        "visible": 0,
        "funct": "concat_ws(', ',Person.Lastname, Person.GivenName)",
        "width": 150
    },
    "Name": {
        "field": "Person.Lastname",
        "visible": 1,
        "function": "intranet.ui.profile.getAllPersonalInfos",
        "param": {
            "value": "#=PersonID#,840",
            "description": "Name"
        },
        "width": 80
    },
    "Vorname": {
        "field": "Person.GivenName",
        "visible": 1,
        "width": 80
    },
    "Mail": {
        "field": "PersonCoordinateValues.Email",
        "visible": 1,
        "width": 200
    },
    "Fachtyp": {
        "field": "SubjectType.SubjectTypeShort",
        "visible": 1,
        "width": 80
    },
    "Profil": {
        "field": "Profile.Profile",
        "visible": 1,
        "width": 50
    },
    "Promotionsstand": {
        "field": "mlpr.PromotionRank",
        "visible": 0,
        "width": 200
    },
    "Klasse": {
        "field": "Class.ClassShort",
        "visible": 1,
        "width": 50
    },
    "Adresse": {
        "field": "Address.Street1",
        "visible": 1,
        "width": 120
    },
    "PLZ": {
        "field": "Address.Zip",
        "visible": 1,
        "width": 50
    },
    "Ort": {
        "field": "Address.City",
        "visible": 1,
        "width": 70
    },
    "Telefon": {
        "field": "PersonCoordinateValues.TelefonP",
        "visible": 1
    }
}
```

### 850
```
{
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Name": {
        "field": "p.Lastname",
        "visible": 0,
        "width": 150
    },
    "Vorname": {
        "field": "p.GivenName",
        "visible": 0,
        "width": 150
    },
    "Klasse": {
        "field": "c.Class",
        "visible": 0,
        "width": 150
    },
    "Kurs": {
        "field": "ec.Label",
        "visible": 1,
        "width": 350
    },
    "Buchungen": {
        "field": "COUNT(p.PersonID)",
        "visible": 1
    }
}
```

### 860
```
{
    "ID": {
        "sql": "LPAD(m.MatarID,3,'0')",
        "width": 60,
        "visible": 1
    },
    "PersonID": {
        "field": "pst.PersonID",
        "visible": 0
    },
    "Titel": {
        "sql": "REPLACE(REPLACE(m.MatarTitle,'\\'','`'),'\"','`')",
        "visible": 1,
        "width": 550
    },
    "Schüler": {
        "sql": "GROUP_CONCAT(DISTINCT CONCAT(pst.Lastname, ' ', pst.GivenName,' (',cl.Class,')') ORDER BY 1 SEPARATOR ', ')",
        "visible": 1,
        "width": 150
    },
    "Betreuer": {
        "sql": "IFNULL(CONCAT(pc.Lastname,' ', pc.GivenName),'')",
        "width": 150,
        "visible": 1
    },
    "Experte": {
        "sql": "IFNULL(CONCAT(pce.Lastname,' ', pce.GivenName),mce.ExternalConsultant)",
        "width": 150,
        "visible": 1
    },
    "Fach": {
        "field": "msj.MatarSubject",
        "visible": 1
    }
}
```

### 870
```
{
    "PersonID": {
        "field": "piu.PersonID",
        "visible": 0,
        "width": 0
    },
    "Name": {
        "field": "piu.Lastname",
        "visible": 1,
        "width": 150
    },
    "Vorname": {
        "field": "piu.GivenName",
        "visible": 1,
        "width": 150
    },
    "Klasse": {
        "field": "cl.Class",
        "visible": 1,
        "width": 150
    },
    "Semester": {
        "field": "c.PeriodID",
        "visible": 1,
        "width": 150
    },
    "LP": {
        "field": "p.Acronym",
        "visible": 1,
        "width": 100
    },
    "Kurs": {
        "field": "c.Course",
        "visible": 1
    },
    "Tag": {
        "sql": "DAYOFWEEK(t.Date)-1",
        "visible": 1
    },
    "von": {
        "sql": "LEFT(t.StartTime,5)",
        "visible": 1
    },
    "bis": {
        "sql": "LEFT(t.EndTime,5)",
        "visible": 1
    }
}
```

### 1000
```
{
    "CourseID": {
        "field": "ec.EnrollmentCourseID",
        "visible": 0
    },
    "Angebot": {
        "field": "ec.label",
        "function": "intranet.list.rightGrid.showRightSlideIn",
        "link": {
            "url": "/list/getlist/list/1100/id/",
            "description": "Angebot",
            "param": "CourseID"
        },
        "visible": 1
    },
    "Anzahl": {
        "field": "Anzahl",
        "sql": "COUNT(DISTINCT ecp.PersonID)",
        "visible": 1
    },
    "Leitung": {
        "field": "Leitung",
        "sql": "Substring(ec.OptionalFields, Locate('\"Teacher\";\"', ec.OptionalFields) + 26, 10)",
        "visible": 1
    },
    "Datum": {
        "field": "Datum",
        "sql": "DATE_FORMAT(Substring(ec.OptionalFields, Locate('\"date\";s:10:\"', ec.OptionalFields) + 13, 10),'%d.%m.%Y')",
        "visible": 1
    }
}
```

### 1100
```
{
    "Kurs": {
        "field": "ec.Label",
        "visible": 1,
        "width": 350
    },
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Name": {
        "field": "p.Lastname",
        "visible": 1,
        "width": 150
    },
    "Vorname": {
        "field": "p.GivenName",
        "visible": 1,
        "width": 150
    },
    "Klasse": {
        "field": "c.Class",
        "visible": 1,
        "width": 150
    }
}
```

### 1101
```
{
    "Kurs": {
        "field": "ec.Label",
        "visible": 1,
        "width": 200
    },
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Name": {
        "field": "p.Lastname",
        "visible": 1,
        "width": 150
    },
    "Vorname": {
        "field": "p.GivenName",
        "visible": 1,
        "width": 150
    },
    "Klasse": {
        "field": "c.Class",
        "visible": 1,
        "width": 150
    }
}
```

### 1202
```
{
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "S_Name": {
        "field": "ps.Lastname",
        "visible": 1,
        "width": 200
    },
    "S_Vorname": {
        "field": "ps.GivenName",
        "visible": 1,
        "width": 200
    },
    "Klasse": {
        "field": "cl.Class",
        "visible": 1,
        "width": 100
    },
    "Kurs": {
        "field": "c.Course",
        "visible": 1,
        "width": 250
    },
    "L_Name": {
        "field": "p.Lastname",
        "visible": 1,
        "width": 200
    },
    "L_Vorname": {
        "field": "p.GivenName",
        "visible": 1,
        "width": 200
    },
    "EMail": {
        "field": "pcv.Email",
        "function": "intranet.ui.profile.getEmailPopUp",
        "param": {
            "value": "#=PersonID#",
            "description": "EMail"
        },
        "visible": 1
    }
}
```

### 1203
```
{
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Lehrperson": {
        "sql": "CONCAT(p.Lastname,', ',p.GivenName)",
        "visible": 1,
        "width": 200
    },
    "Kurs": {
        "field": "c.Course",
        "visible": 1,
        "width": 250
    },
    "Anzahl": {
        "sql": "COUNT(DISTINCT ps.PersonID)",
        "visible": 1,
        "width": 250
    },
    "EMail": {
        "field": "pcv.Email",
        "function": "intranet.ui.profile.getEmailPopUp",
        "param": {
            "value": "#=PersonID#",
            "description": "EMail"
        },
        "visible": 1
    }
}
```

### 1204
```
{
    "PersonID": {
        "field": "p.PersonID",
        "visible": 0
    },
    "Kurs": {
        "field": "c.Course",
        "visible": 1,
        "width": 250
    },
    "Name": {
        "field": "ps.Lastname",
        "visible": 1,
        "width": 200
    },
    "Vorname": {
        "field": "ps.GivenName",
        "visible": 1,
        "width": 200
    },
    "Klasse": {
        "field": "cl.Class",
        "visible": 1
    }
}
```

### 1301
```
{
    "PersonID": {
        "field": "t.ModificationPersonID",
        "visible": 0
    },
    "Datum": {
        "field": "DATE_FORMAT(t.Date,'%d.%m.%Y')",
        "width": 100,
        "visible": 1
    },
    "Zeit": {
        "field": "CONCAT(DATE_FORMAT(t.StartTime,'%H:%i'),'-',DATE_FORMAT(t.EndTime,'%H:%i'))",
        "width": 100,
        "visible": 1
    },
    "bis": {
        "field": "DATE_FORMAT(t.EndTime,'%H:%i')",
        "width": 100,
        "visible": 0
    },
    "Titel": {
        "field": "tm.Title",
        "visible": 1,
        "width": 150
    },
    "Raum_Resource": {
        "field": "IF(t.TimetableEntryTypeID=2,CONCAT(r.Resource,' (',r.Description,')'),CONCAT(l.Location,' (',l.Description,')'))",
        "visible": 1
    },
    "Beschrieb": {
        "field": "l.Description",
        "visible": 0
    }
}
```

### 1302
```
{
    "ID": {
        "field": "IF(reservations.LocationID IS NULL, reservations.ResourceID, reservations.LocationID)",
        "visible": 0
    },
    "Raum_Ressource": {
        "field": "reservations.Name",
        "visible": 1
    },
    "Datum": {
        "field": "DATE_FORMAT(reservations.Date, '%d.%m.%Y')",
        "width": 90,
        "visible": 1
    },
    "Zeit": {
        "field": "CONCAT(DATE_FORMAT(reservations.StartTime, '%H:%i'), ' - ', DATE_FORMAT(reservations.EndTime, '%H:%i'))",
        "width": 100,
        "visible": 1
    },
    "Titel": {
        "field": "reservations.Title",
        "visible": 1
    },
    "Beschreibung": {
        "field": "reservations.Description",
        "visible": 1
    },
    "Link": {
        "field": "concat('timetable/reservation/',\n                IF(reservations.LocationID IS NOT NULL, CONCAT(\n                'locationId/', reservations.LocationID), CONCAT(\n                                                 'resourceId/',\n                reservations.ResourceID)), '/timestamp/',\n                UNIX_TIMESTAMP(reservations.Date))",
        "template": "<a href= '#: Link #' target='_blank'>zur Reservation</a>",
        "visible": 1
    }
}
```

### 1402
```
{
    "PulsID": {
        "field": "Puls.PulsID",
        "visible": 0
    },
    "PersNr": {
        "field": "Puls.PersonalNumber",
        "visible": 1
    },
    "AnstNr": {
        "field": "Puls.AppointmentNumber",
        "visible": 1
    },
    "Name": {
        "field": "Puls.Lastname",
        "visible": 1
    },
    "Vorname": {
        "field": "Puls.GivenName",
        "visible": 1
    },
    "Stellen_Bez": {
        "field": "Puls.AppointmentType",
        "visible": 1
    },
    "AnstEnde": {
        "field": "REPLACE(DATE_FORMAT(Puls.AppointmentEnd,'%d.%m.%Y'),'00.00.0000','')",
        "visible": 1
    },
    "AnstEnde_neu": {
        "field": "DATE_FORMAT(Puls.AppointmentEndSchool,'%d.%m.%Y')",
        "visible": 1
    },
    "zugesBG": {
        "field": "Puls.LessonsWarranted",
        "visible": 1
    },
    "PflStd": {
        "field": "Puls.LessonsBase",
        "visible": 1
    },
    "WStd_ist": {
        "field": "Puls.LessonsPaid",
        "visible": 1
    },
    "WStd_ist_neu": {
        "field": "Puls.LessonsPaidSchool",
        "visible": 1
    },
    "BG_ist": {
        "field": "Puls.LevelOfAppointment",
        "visible": 1
    },
    "BG_ist_neu": {
        "field": "Puls.LevelOfAppointmentSchool",
        "visible": 1
    },
    "LOA_5520": {
        "field": "Puls.PayrollDeduction",
        "visible": 1
    },
    "LOA_5520_neu": {
        "field": "Puls.PayrollDeductionSchool",
        "visible": 1
    }
}
```

### 1403
```
{
    "PulsID": {
        "field": "Puls.PulsID",
        "visible": 0
    },
    "PersNr": {
        "field": "Puls.PersonalNumber",
        "visible": 1
    },
    "AnstNr": {
        "field": "Puls.AppointmentNumber",
        "visible": 1
    },
    "Name": {
        "field": "Puls.Lastname",
        "visible": 1
    },
    "Vorname": {
        "field": "Puls.GivenName",
        "visible": 1
    },
    "Stellen_Bez": {
        "field": "Puls.AppointmentType",
        "visible": 1
    },
    "AnstEnde": {
        "field": "REPLACE(DATE_FORMAT(Puls.AppointmentEnd,'%d.%m.%Y'),'00.00.0000','')",
        "visible": 1
    },
    "AnstEnde_neu": {
        "field": "DATE_FORMAT(Puls.AppointmentEndSchool,'%d.%m.%Y')",
        "visible": 1
    },
    "zugesBG": {
        "field": "Puls.LessonsWarranted",
        "visible": 1
    },
    "PflStd": {
        "field": "Puls.LessonsBase",
        "visible": 1
    },
    "WStd_ist": {
        "field": "Puls.LessonsPaid",
        "visible": 1
    },
    "WStd_ist_neu": {
        "field": "Puls.LessonsPaidSchool",
        "visible": 1
    },
    "BG_ist": {
        "field": "Puls.LevelOfAppointment",
        "visible": 1
    },
    "BG_ist_neu": {
        "field": "Puls.LevelOfAppointmentSchool",
        "visible": 1
    },
    "LOA_5520": {
        "field": "Puls.PayrollDeduction",
        "visible": 1
    },
    "LOA_5520_neu": {
        "field": "Puls.PayrollDeductionSchool",
        "visible": 1
    }
}
```

### 1410
```
{
    "StkkID": {
        "field": "Stkk.StkkID",
        "visible": 0
    },
    "PersNr": {
        "field": "Stkk.PersonalNumber",
        "visible": 1
    },
    "AnstNr": {
        "field": "Stkk.AppointmentNumber",
        "visible": 1
    },
    "Name": {
        "field": "Stkk.Lastname",
        "visible": 1
    },
    "Vorname": {
        "field": "Stkk.GivenName",
        "visible": 1
    },
    "Funktion": {
        "field": "Stkk.AppointmentType",
        "visible": 1
    },
    "Pflichtlektionen": {
        "field": "Stkk.LessonsBase",
        "visible": 1
    },
    "Auszuzahlender_BG": {
        "field": "Stkk.LessonsPaid",
        "visible": 1
    },
    "zuges_BG": {
        "field": "Stkk.LessonsWarranted",
        "visible": 1
    },
    "Unterricht": {
        "field": "Stkk.LevelOfAppointment",
        "visible": 1
    },
    "ZL_intern": {
        "field": "Stkk.AdditionalServicesInt",
        "visible": 1
    },
    "ZL_extern": {
        "field": "Stkk.AdditionalServicesExt",
        "visible": 1
    },
    "Stand_STKK": {
        "field": "Stkk.LessonBalanceEndSemester",
        "visible": 1
    },
    "DAG_Guthaben": {
        "field": "Stkk.Balance",
        "visible": 1
    }
}
```

### 1452
```
{
    "PersonID": {
        "field": "Person.PersonID",
        "visible": 0
    },
    "Name": {
        "field": "Person.Lastname",
        "visible": 1
    },
    "Vorname": {
        "field": "Person.GivenName",
        "visible": 1
    },
    "Personalnummer": {
        "field": "Person.PersonalNumber",
        "visible": 1
    },
    "Anstellungsnummer": {
        "field": "LPAD(PersonPayroll.AppointmentNumber,2,'0')",
        "visible": 1
    },
    "Anstellung": {
        "field": " PersonDepartment.AppointmentType",
        "visible": 1
    },
    "Prädikat_MAB": {
        "field": "PersonPayroll.MABGrade",
        "visible": 1
    },
    "letztes_Beurteilungsdatum": {
        "sql": "DATE_FORMAT( GREATEST( IFNULL(PersonPayroll.AssessmentDate, '0000-00-00'), IFNULL(PersonPayroll.IntermediateAssessmentDate, '0000-00-00'), IFNULL(PersonPayroll.AssistantAssessmentDate, '0000-00-00')), '%d.%m.%Y')",
        "visible": 1
    }
}
```

### 1500
```
{
    "TimetableID": {
        "field": "tt.TimetableID",
        "visible": 0
    },
    "Datum": {
        "field": "tt.Date",
        "type": "date",
        "visible": 1,
        "width": 100
    },
    "Startzeit": {
        "field": "tt.StartTime",
        "visible": 1,
        "width": 100
    },
    "Endzeit": {
        "field": "tt.EndTime",
        "visible": 1,
        "width": 100
    },
    "Lektion": {
        "field": "tt.Title",
        "visible": 1
    },
    "Lehrperson": {
        "field": "tt.TeacherName",
        "visible": 1
    },
    "Klasse": {
        "field": "tt.ClassName",
        "visible": 1
    },
    "Raum": {
        "field": "tt.Location",
        "visible": 1
    },
    "Titel": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.title')",
        "visible": 1
    },
    "Beschreibung": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.description')",
        "visible": 1
    },
    "Anhang": {
        "field": "JSON_GET(JsonData, '$.lesson.homework.attachments')",
        "template": "# var timestamp = Math.floor(Date.now() / 1000); # # $.each(Anhang ? JSON.parse(Anhang) : [], function(attachmentKey, attachmentData) { # # if (attachmentData.deleteAtTimestamp == 0 || attachmentData.deleteAtTimestamp > timestamp) { # #= \"<a href='\" + baseUrl + school + '/timetable/download-lesson-attachment/filename/' + attachmentData.filename + '/csrfToken/' + csrfToken +'/path/' + attachmentData.path + \"'>\" + attachmentData.filename + \"</a>\" #\n # } # # }); #",
        "visible": 1
    }
}
```

### 1501
```
{
    "TimetableID": {
        "field": "tt.TimetableID",
        "visible": 0
    },
    "Datum": {
        "field": "tt.Date",
        "type": "date",
        "visible": 1,
        "width": 100
    },
    "Startzeit": {
        "field": "tt.StartTime",
        "visible": 1,
        "width": 100
    },
    "Endzeit": {
        "field": "tt.EndTime",
        "visible": 1,
        "width": 100
    },
    "Lektion": {
        "field": "tt.Title",
        "visible": 1
    },
    "Lehrperson": {
        "field": "tt.TeacherName",
        "visible": 1
    },
    "Klasse": {
        "field": "tt.ClassName",
        "visible": 1
    },
    "Raum": {
        "field": "tt.Location",
        "visible": 1
    },
    "Titel": {
        "sql": "JSON_GET(JsonData, '$.lesson.exam.title')",
        "visible": 1
    },
    "Beschreibung": {
        "sql": "JSON_GET(JsonData, '$.lesson.exam.description')",
        "visible": 1
    },
    "Anhang": {
        "field": "JSON_GET(JsonData, '$.lesson.exam.attachments')",
        "template": "# var timestamp = Math.floor(Date.now() / 1000); # # $.each(Anhang ? JSON.parse(Anhang) : [], function(attachmentKey, attachmentData) { # # if (attachmentData.deleteAtTimestamp == 0 || attachmentData.deleteAtTimestamp > timestamp) { # #= \"<a href='\" + baseUrl + school + '/timetable/download-lesson-attachment/filename/' + attachmentData.filename + '/csrfToken/' + csrfToken + '/path/' + attachmentData.path + \"'>\" + attachmentData.filename + \"</a>\" #\n # } # # }); #",
        "visible": 1
    }
}
```

### 1502
```
{
    "TimetableID": {
        "field": "tt.TimetableID",
        "visible": 0
    },
    "Datum": {
        "field": "tt.Date",
        "type": "date",
        "visible": 1,
        "width": 100
    },
    "Startzeit": {
        "field": "tt.StartTime",
        "visible": 1,
        "width": 100
    },
    "Endzeit": {
        "field": "tt.EndTime",
        "visible": 1,
        "width": 100
    },
    "Lektion": {
        "field": "tt.Title",
        "visible": 1
    },
    "Lehrperson": {
        "field": "tt.TeacherName",
        "visible": 1
    },
    "Klasse": {
        "field": "tt.ClassName",
        "visible": 1
    },
    "Raum": {
        "field": "tt.Location",
        "visible": 1
    },
    "Titel": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.title')",
        "visible": 1
    },
    "Beschreibung": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.description')",
        "visible": 1
    },
    "Anhang": {
        "field": "JSON_GET(JsonData, '$.lesson.homework.attachments')",
        "template": "# var timestamp = Math.floor(Date.now() / 1000); # # $.each(Anhang ? JSON.parse(Anhang) : [], function(attachmentKey, attachmentData) { # # if (attachmentData.deleteAtTimestamp == 0 || attachmentData.deleteAtTimestamp > timestamp) { # #= \"<a href='\" + baseUrl + school + '/timetable/download-lesson-attachment/filename/' + attachmentData.filename + '/csrfToken/' + csrfToken + '/path/' + attachmentData.path + \"'>\" + attachmentData.filename + \"</a>\" #\n # } # # }); #",
        "visible": 1
    }
}
```

### 1503
```
{
    "TimetableID": {
        "field": "tt.TimetableID",
        "visible": 0
    },
    "Datum": {
        "field": "tt.Date",
        "type": "date",
        "visible": 1,
        "width": 100
    },
    "Startzeit": {
        "field": "tt.StartTime",
        "visible": 1,
        "width": 100
    },
    "Endzeit": {
        "field": "tt.EndTime",
        "visible": 1,
        "width": 100
    },
    "Lektion": {
        "field": "tt.Title",
        "visible": 1
    },
    "Lehrperson": {
        "field": "tt.TeacherName",
        "visible": 1
    },
    "Klasse": {
        "field": "tt.ClassName",
        "visible": 1
    },
    "Raum": {
        "field": "tt.Location",
        "visible": 1
    },
    "Titel": {
        "sql": "JSON_GET(JsonData, '$.lesson.exam.title')",
        "visible": 1
    },
    "Beschreibung": {
        "sql": "JSON_GET(JsonData, '$.lesson.exam.description')",
        "visible": 1
    },
    "Anhang": {
        "field": "JSON_GET(JsonData, '$.lesson.exam.attachments')",
        "template": "# var timestamp = Math.floor(Date.now() / 1000); # # $.each(Anhang ? JSON.parse(Anhang) : [], function(attachmentKey, attachmentData) { # # if (attachmentData.deleteAtTimestamp == 0 || attachmentData.deleteAtTimestamp > timestamp) { # #= \"<a href='\" + baseUrl + school + '/timetable/download-lesson-attachment/filename/' + attachmentData.filename +'/csrfToken/' + csrfToken + '/path/' + attachmentData.path + \"'>\" + attachmentData.filename + \"</a>\" #\n # } # # }); #",
        "visible": 1
    }
}
```

### 1504
```
{
    "TimetableID": {
        "field": "tt.TimetableID",
        "visible": 0
    },
    "Datum": {
        "field": "tt.Date",
        "type": "date",
        "visible": 1,
        "width": 100
    },
    "Startzeit": {
        "field": "tt.StartTime",
        "visible": 1,
        "width": 100
    },
    "Endzeit": {
        "field": "tt.EndTime",
        "visible": 1,
        "width": 100
    },
    "Lektion": {
        "field": "tt.Title",
        "visible": 1
    },
    "Lehrperson": {
        "field": "tt.TeacherName",
        "visible": 1
    },
    "Klasse": {
        "field": "tt.ClassName",
        "visible": 1
    },
    "Raum": {
        "field": "tt.Location",
        "visible": 1
    },
    "Titel": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.title')",
        "visible": 1
    },
    "Beschreibung": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.description')",
        "visible": 1
    },
    "Anhang": {
        "field": "JSON_GET(JsonData, '$.lesson.homework.attachments')",
        "template": "# var timestamp = Math.floor(Date.now() / 1000); # # $.each(Anhang ? JSON.parse(Anhang) : [], function(attachmentKey, attachmentData) { # # if (attachmentData.deleteAtTimestamp == 0 || attachmentData.deleteAtTimestamp > timestamp) { # #= \"<a href='\" + baseUrl + school + '/timetable/download-lesson-attachment/filename/' + attachmentData.filename + '/csrfToken/' + csrfToken + '/path/' + attachmentData.path + \"'>\" + attachmentData.filename + \"</a>\" #\n # } # # }); #",
        "visible": 1
    }
}
```

### 1505
```
{
    "TimetableID": {
        "field": "tt.TimetableID",
        "visible": 0
    },
    "Datum": {
        "field": "tt.Date",
        "type": "date",
        "visible": 1,
        "width": 100
    },
    "Startzeit": {
        "field": "tt.StartTime",
        "visible": 1,
        "width": 100
    },
    "Endzeit": {
        "field": "tt.EndTime",
        "visible": 1,
        "width": 100
    },
    "Lektion": {
        "field": "tt.Title",
        "visible": 1
    },
    "Lehrperson": {
        "field": "tt.TeacherName",
        "visible": 1
    },
    "Klasse": {
        "field": "tt.ClassName",
        "visible": 1
    },
    "Raum": {
        "field": "tt.Location",
        "visible": 1
    },
    "Titel": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.title')",
        "visible": 1
    },
    "Beschreibung": {
        "sql": "JSON_GET(JsonData, '$.lesson.homework.description')",
        "visible": 1
    },
    "Anhang": {
        "field": "JSON_GET(JsonData, '$.lesson.homework.attachments')",
        "template": "# var timestamp = Math.floor(Date.now() / 1000); # # $.each(Anhang ? JSON.parse(Anhang) : [], function(attachmentKey, attachmentData) { # # if (attachmentData.deleteAtTimestamp == 0 || attachmentData.deleteAtTimestamp > timestamp) { # #= \"<a href='\" + baseUrl + school + '/timetable/download-lesson-attachment/filename/' + attachmentData.filename + '/csrfToken/' + csrfToken +'/path/' + attachmentData.path + \"'>\" + attachmentData.filename + \"</a>\" #\n # } # # }); #",
        "visible": 1
    }
}
```