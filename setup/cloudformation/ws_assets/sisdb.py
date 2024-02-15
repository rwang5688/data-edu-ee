# MIT No Attribution

# Copyright (c) 2021 Amazon Web Services (AWS)

# Permission is hereby granted, free of charge, to any person obtaining a copy of this
# software and associated documentation files (the "Software"), to deal in the Software
# without restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from __future__ import print_function
import os
import boto3
from botocore.exceptions import ClientError
import base64
import logging
import json
import csv
import mysql.connector
import rds_credentials
import urllib.request
import os

import logging
logger = logging.getLogger(__name__)




def connect(db=""):
    creds = rds_credentials.get_secret()
    rdshost = creds["host"]
    rdsport = creds["port"]
    rdsusername = creds["username"]
    rdspassword = creds["password"]


    if db == "":
        mydb = mysql.connector.connect(
            host=rdshost, 
            port=rdsport,
            user=rdsusername,
            password=rdspassword
            )
    else:
        mydb = mysql.connector.connect(
            host=rdshost, 
            port=rdsport,
            user=rdsusername,
            password=rdspassword,
            database=db)

    return mydb
   
def getDBName(dbNameParm):
    if dbNameParm == "":
        return "sisdemo"
    else:
        return dbNameParm
        
def initEmptySISDb(dbName = "", drop_on_exception=False):
    dbname = getDBName(dbName)

    createSQL = "CREATE DATABASE {}".format(dbname)
    dropSQL   = "DROP DATABASE {}".format(dbname)
    
    with connect() as db:
        cur = db.cursor()
        try:
            cur.execute(createSQL)
        except Exception as e:
            if drop_on_exception:
                cur.execute(dropSQL)
                cur.execute(createSQL)
            else:
                raise e
        
        

def showDatabases():
    with connect() as db:
        cur = db.cursor()
        cur.execute("SHOW DATABASES")
        
        for x in cur:
            print(x)
            
def showTables(dbName=""):
    with connect(getDBName(dbName)) as db:
        cur = db.cursor()
        cur.execute("SHOW TABLES")
        
        for x in cur:
            print(x)
            
def summarizeTables(dbName=""):
    with connect(getDBName(dbName)) as db:
        cur = db.cursor()
        cur.execute("SHOW TABLES")
        
        for x in cur:
            t = x[0]
            print("Summarizing table {}".format(t))
            sampleTable(dbName=dbName,tableName=t)
            print("\n")
            
def sampleTable(tableName,limit=5,dbName=""):
    with connect(getDBName(dbName)) as db:
        cur = db.cursor()
        cur.execute("SELECT * FROM {} LIMIT {}".format(tableName,limit))
        myresult = cur.fetchall()
        for x in myresult:
            print(x)
            
        cur.execute("SELECT COUNT(*) from {}".format(tableName))
        myresult = cur.fetchall()
        for x in myresult:
            print("Row Count: {}".format(x[0]))
            
  
def sisTables():
    tableList = [
        "course",
        "course_outcome",
        "course_registration",
        "course_schedule",
        "degree_plan",
        "department", 
        "ed_level", 
        "faculty", 
        "school", 
        "semester", 
        "student",
        "university"]

    return tableList
    
def initEmptySISDbTables(dbName="", drop_on_exception=False):

    tableList = sisTables()
    
    with connect(getDBName(dbName)) as db:
        cur = db.cursor()
        
        for t in tableList:
            print("Creating table {}".format(t))
            try:
                cur.execute(getSQLScript(t))
            except Exception as e:
                if drop_on_exception:
                    cur.execute("DROP TABLE {}".format(t))
                    cur.execute(getSQLScript(t))
                else:
                    raise e
        
def getSQLScript(name):
    path = "./sql/scripts/{}.sql".format(name)
    print(path)
    with open(path, "r") as f:
        sSQL = f.readlines()
        
    return " ".join(sSQL)
    
def loadInitialData(tableName,dbName=""):
    with connect(getDBName(dbName)) as db:
        cur = db.cursor()
        local_filename = loadDataForTable(tableName)
        print("Data for {} downloaded locally into {}".format(tableName,local_filename))
        if local_filename != "":
            with open (local_filename, 'r') as f:
                data = [tuple(line) for line in csv.reader(f, delimiter=",")]
        
            column_names = data[0]
            data_rows    = data[1:]
            print("   loading {} rows".format(len(data_rows)))
            
            sSQL = "INSERT INTO {} ({}) VALUES({})".format(
                tableName,
                ",".join(column_names),
                ",".join((('%s'),) * len(column_names))
                )

            try:
                try:
                    print("   Inserting in bulk")
                    cur.executemany(sSQL, data_rows)
                except Exception as e:
                    print("   Bulk insert failed ==> inserting row by row")
                    for r in data_rows:
                        print(r)
                        try:
                            cur.execute(sSQL, r)
                        except Exception as e:
                            print ("   Error loading row [SKIPPING]")
                            print(r)
                            print(e)
                    
                print("   committing")
                db.commit()
                
                print("    removing temp file {}".format(local_filename))
                os.remove(local_filename)
                
            except Exception as e:
                print ("Error occurred loading {}".format(tableName))
                print(e)
    



def loadDataForTable(tableName):
    try:
        dataURL = "https://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee.s3.amazonaws.com/296c402e-cadd-43f5-956b-116895a050f9/v1/mockdata/sis_demo/{}/LOAD00000001.csv".format(tableName)
        local_filename, headers = urllib.request.urlretrieve(dataURL)
        return local_filename
    except Exception as e:
        print("  Error downloading data for {}".format(tableName))
        print(e)
        return ""
    
