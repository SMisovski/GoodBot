import sqlite3
from sqlite3 import Error
import logging
import discord
import util

DB_FILE = 'pythonsqlite.db'
PIN_LIMIT = 4

class SqlMessage:
    def __init__(self, data_list, attachment_list):
        self.message_id = data_list[0]
        self.channel_id = data_list[1]
        self.content = data_list[2]
        self.user_id = data_list[3]
        self.created_at = data_list[4]
        self.pinned = data_list[5]
        self.attachment_list = []
        for attachment in attachment_list:
            self.attachment_list.append(attachment[0])

def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)
        logging.debug(e)
    return conn

def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)
        logging.debug(e)

def table_setup(db_file):
    conn = create_connection(db_file)
    sql_create_channel_table = """ CREATE TABLE IF NOT EXISTS text_channels (
                                id integer PRIMARY KEY,
                                name text NOT NULL
                            ); """
    sql_create_messages_table= """ CREATE TABLE IF NOT EXISTS messages (
                                    id integer PRIMARY KEY,
                                    channel_id integer,
                                    contents text,
                                    author integer,
                                    attachments text,
                                    created_at integer,
                                    pinned text DEFAULT False,
                                    FOREIGN KEY(channel_id) REFERENCES text_channels(id)
                                ); """
    sql_create_attachment_table= """ CREATE TABLE IF NOT EXISTS attachments (
                                        id integer PRIMARY KEY,
                                        message_id integer NOT NULL,
                                        url text,
                                        FOREIGN KEY(message_id) REFERENCES messages(id)
                                ); """

    sql_create_user_table="""CREATE TABLE IF NOT EXISTS users (
                            id integer PRIMARY KEY,
                            name text
                        ); """

    sql_create_warning_table="""CREATE TABLE IF NOT EXISTS warnings (
                            user_id integer,
                            message_id integer,
                            FOREIGN KEY(message_id) REFERENCES messages(id),
                            FOREIGN KEY(user_id) REFERENCES users(id)
                        ); """


    create_table(conn, sql_create_channel_table)
    create_table(conn, sql_create_messages_table)
    create_table(conn, sql_create_attachment_table)
    create_table(conn, sql_create_user_table)
    create_table(conn, sql_create_warning_table)

    conn.close()

def insert_message(message, db_file):
    conn = create_connection(db_file)
    insert_message = [message.id, message.channel.id, message.content, message.created_at, str(message.pinned), message.author.id]
    sql = ''' INSERT OR IGNORE INTO messages(id,channel_id,contents,created_at,pinned,author)
              VALUES(?,?,?,?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, insert_message)

    if message.attachments:
        for attachment in message.attachments:
            insert_attachment = [attachment.id, message.id, attachment.url]
            sql = ''' INSERT OR IGNORE INTO attachments(id,message_id,url)
                    VALUES(?,?,?) '''
            cur.execute(sql, insert_attachment)

    conn.commit()
    logging.info("Inserted message into SQL db: {}".format(insert_message))
    conn.close()

def insert_text_channel(channel, db_file):
    conn = create_connection(db_file)
    insert = [channel.id,channel.name]
    sql = ''' INSERT OR IGNORE INTO text_channels(id,name)
              VALUES(?,?) '''
    cur = conn.cursor()
    try:
        cur.execute(sql, insert)
    except Error as e:
        print(e)
        logging.debug(e)
    conn.commit()
    conn.close()

def get_pinned_messages(content, message, db_file):
    offset = 0
    if content is not util.PINS_COMMAND:
        message_suffix = content[len(util.PINS_COMMAND):].strip()
        if message_suffix.isdigit() is True:
           offset = message_suffix
    conn = create_connection(db_file)
    text_channel_id = message.channel.id
    sql = ''' SELECT * FROM messages WHERE channel_id = {} AND pinned = "True" ORDER BY created_at desc LIMIT {} OFFSET {}'''.format(text_channel_id, PIN_LIMIT, offset)
    cur = conn.cursor()
    try:
        cur.execute(sql)
    except Error as e:
        print(e)
        logging.debug(e)
    rows = cur.fetchall()
    out_messages = sql_out_to_message_dict(rows)
    conn.close()
    return out_messages

def sql_out_to_message_dict(rows):
    out_messages = []
    conn = create_connection(DB_FILE)
    cur = conn.cursor()
    for row in rows:
        sql = ''' SELECT url from attachments WHERE message_id = {}'''.format(row[0])
        try:
            cur.execute(sql)
        except Error as e:
            print(e)
            logging.debug(e)
        attachment_rows = cur.fetchall()
        out_messages.append(SqlMessage(row, attachment_rows))
    out_messages.reverse()
    conn.close()
    return out_messages

def insert_warning(message, mention, db_file):
    conn = create_connection(db_file)
    insert_list = [mention.id, message.id]
    insert_message(message, db_file)
    sql = ''' INSERT OR IGNORE INTO warnings(user_id, message_id)
    VALUES(?,?);
    '''
    cur = conn.cursor()
    cur.execute(sql, insert_list)
    conn.commit()
    logging.info("Inserted message into SQL db: {}".format(insert_list))
    conn.close()

def return_warnings(member):
    conn = create_connection(DB_FILE)
    sql = ''' SELECT * FROM warnings WHERE user_id = ? '''
    cur = conn.cursor()
    try:
        cur.execute(sql, [member.id])
    except Error as e:
        print(e)
        logging.debug(e)
    rows = cur.fetchall()
    conn.close()
    return rows


